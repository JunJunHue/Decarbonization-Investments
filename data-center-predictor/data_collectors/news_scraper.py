"""
News scraper to extract investment gap and funding data from news articles
Scrapes daily from multiple sources to get real-time investment metrics
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import re
import json
import time
from typing import Dict, List, Optional

class NewsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.material_keywords = {
            'steel': ['steel', 'iron', 'decarbonization', 'green steel', 'hydrogen steel'],
            'cement': ['cement', 'concrete', 'clinker', 'carbon capture', 'green cement'],
            'aluminum': ['aluminum', 'aluminium', 'smelting', 'green aluminum', 'renewable aluminum'],
            'copper': ['copper', 'mining', 'copper supply', 'copper shortage', 'copper investment'],
            'rare_earths': ['rare earth', 'rare earth elements', 'REE', 'critical minerals', 'rare earth metals']
        }
        
    def search_google_news(self, query: str, max_results: int = 10) -> List[Dict]:
        """Search Google News for articles"""
        try:
            # Use Google News RSS feed
            url = f"https://news.google.com/rss/search?q={query}&hl=en-US&gl=US&ceid=US:en"
            response = requests.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'xml')
                items = soup.find_all('item')[:max_results]
                
                articles = []
                for item in items:
                    title = item.find('title')
                    link = item.find('link')
                    pub_date = item.find('pubDate')
                    description = item.find('description')
                    
                    if title and link:
                        articles.append({
                            'title': title.text if title else '',
                            'link': link.text if link else '',
                            'pub_date': pub_date.text if pub_date else '',
                            'description': description.text if description else ''
                        })
                
                return articles
        except Exception as e:
            print(f"Error searching Google News: {e}")
        
        return []
    
    def extract_funding_amount(self, text: str) -> Optional[float]:
        """Extract funding amounts from text (in billions or millions)"""
        # Pattern to match funding amounts: $X.X billion, $X million, etc.
        patterns = [
            r'\$(\d+\.?\d*)\s*billion',
            r'\$(\d+\.?\d*)\s*B',
            r'(\d+\.?\d*)\s*billion',
            r'\$(\d+\.?\d*)\s*million',
            r'\$(\d+\.?\d*)\s*M',
            r'(\d+\.?\d*)\s*million',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                amount = float(matches[0])
                # Convert to billions
                if 'million' in pattern.lower() or 'M' in pattern:
                    amount = amount / 1000
                return amount
        
        return None
    
    def extract_investment_gap(self, text: str) -> Optional[float]:
        """Extract investment gap percentages or amounts from text"""
        # Look for patterns like "X% gap", "gap of X%", "$X billion gap", etc.
        patterns = [
            r'(\d+\.?\d*)\s*%\s*gap',
            r'gap\s*of\s*(\d+\.?\d*)\s*%',
            r'investment\s*gap\s*of\s*(\d+\.?\d*)\s*%',
            r'(\d+\.?\d*)\s*%\s*unfunded',
            r'(\d+\.?\d*)\s*%\s*needed',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return float(matches[0])
        
        return None
    
    def scrape_article_content(self, url: str) -> Optional[str]:
        """Scrape full article content from URL"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Try to find main content
                content_selectors = [
                    'article',
                    '.article-body',
                    '.content',
                    '.post-content',
                    'main',
                    '[role="main"]'
                ]
                
                for selector in content_selectors:
                    content = soup.select_one(selector)
                    if content:
                        return content.get_text(separator=' ', strip=True)
                
                # Fallback to body text
                return soup.get_text(separator=' ', strip=True)
        except Exception as e:
            print(f"Error scraping article {url}: {e}")
        
        return None
    
    def analyze_articles_for_material(self, material: str) -> Dict:
        """Analyze news articles for a specific material to extract investment metrics"""
        keywords = self.material_keywords.get(material, [material])
        query = f"{' OR '.join(keywords)} investment funding gap decarbonization"
        
        articles = self.search_google_news(query, max_results=20)
        
        total_funding = 0
        funding_count = 0
        gap_percentages = []
        recent_articles = []
        
        for article in articles[:10]:  # Analyze top 10 articles
            text = f"{article.get('title', '')} {article.get('description', '')}"
            
            # Try to get full article content
            if article.get('link'):
                full_content = self.scrape_article_content(article['link'])
                if full_content:
                    text += " " + full_content[:5000]  # Limit to first 5000 chars
            
            # Extract funding amounts
            funding = self.extract_funding_amount(text)
            if funding:
                total_funding += funding
                funding_count += 1
            
            # Extract investment gap
            gap = self.extract_investment_gap(text)
            if gap:
                gap_percentages.append(gap)
            
            # Check if article is recent (within last 30 days)
            pub_date = article.get('pub_date', '')
            if pub_date:
                try:
                    # Parse date (format varies)
                    article_date = datetime.strptime(pub_date[:16], '%a, %d %b %Y')
                    if (datetime.now() - article_date).days <= 30:
                        recent_articles.append(article)
                except:
                    pass
        
        # Calculate metrics
        avg_funding = total_funding / funding_count if funding_count > 0 else 0
        avg_gap = sum(gap_percentages) / len(gap_percentages) if gap_percentages else None
        
        # Convert funding to a percentage scale (0-100)
        # Assume $1B = 10% funding, $10B = 50% funding, $50B+ = 100% funding
        if avg_funding > 0:
            if avg_funding >= 50:
                recent_funding_pct = 100
            elif avg_funding >= 10:
                recent_funding_pct = 50 + (avg_funding - 10) * 1.25
            elif avg_funding >= 1:
                recent_funding_pct = 10 + (avg_funding - 1) * 4.44
            else:
                recent_funding_pct = avg_funding * 10
            recent_funding_pct = min(100, max(0, recent_funding_pct))
        else:
            recent_funding_pct = 15  # Default if no funding found
        
        # Investment gap percentage (inverse of funding)
        if avg_gap:
            investment_gap_pct = min(100, max(0, avg_gap))
        else:
            # Estimate based on funding: more funding = lower gap
            investment_gap_pct = max(70, 100 - recent_funding_pct)
        
        return {
            'investment_gap': investment_gap_pct,
            'recent_funding': recent_funding_pct,
            'articles_analyzed': len(articles),
            'recent_articles': len(recent_articles),
            'avg_funding_billions': avg_funding,
            'avg_gap_percentage': avg_gap,
            'timestamp': datetime.now().isoformat()
        }
    
    def scrape_all_materials(self) -> Dict[str, Dict]:
        """Scrape investment data for all materials"""
        results = {}
        
        material_map = {
            'steel': 'steel',
            'cement': 'cement',
            'aluminum': 'aluminum',
            'copper': 'copper',
            'rare_earths': 'rare_earths'
        }
        
        for material_id, material_name in material_map.items():
            print(f"Scraping news for {material_name}...")
            try:
                results[material_id] = self.analyze_articles_for_material(material_name)
                time.sleep(2)  # Rate limiting
            except Exception as e:
                print(f"Error scraping {material_name}: {e}")
                results[material_id] = {
                    'investment_gap': 85,
                    'recent_funding': 15,
                    'error': str(e)
                }
        
        return results
