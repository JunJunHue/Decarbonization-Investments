"""
Collect real market data for all materials: Steel, Cement, Aluminum, Copper, Rare Earths
"""
import yfinance as yf
import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import json
import time
import os
from typing import Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from .news_scraper import NewsScraper
from .trading_economics_scraper import TradingEconomicsScraper

class MaterialDataCollector:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        self.news_scraper = NewsScraper()
        self.trading_economics = TradingEconomicsScraper()
        # Cache file for daily news data
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.cache_dir = os.path.join(base_dir, "data")
        os.makedirs(self.cache_dir, exist_ok=True)
        self.news_cache_file = os.path.join(self.cache_dir, "news_investment_data.json")
    
    def fetch_steel_data(self):
        """Fetch steel data from Trading Economics: https://tradingeconomics.com/commodity/steel"""
        try:
            # Use Trading Economics scraper
            data = self.trading_economics.fetch_commodity_data('steel')
            if data:
                return data
        except Exception as e:
            print(f"Error fetching steel data from Trading Economics: {e}")
        
        # Fallback to yfinance
        try:
            steel_etf = yf.Ticker("SLX")  # VanEck Steel ETF
            data = steel_etf.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                if len(data) >= 30:
                    price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                else:
                    price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                hist_data = historical[-90:] if len(historical) >= 90 else historical
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'SLX ETF (Steel proxy)',
                    'historical': hist_data
                }
        except Exception as e:
            print(f"Error fetching steel data: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    
    def fetch_cement_data(self):
        """Fetch cement/concrete data from FRED API: https://fred.stlouisfed.org/series/PCU32733273"""
        try:
            # FRED API endpoint for Producer Price Index: Cement and Concrete Product Manufacturing
            fred_series_id = "PCU32733273"
            fred_api_key = os.getenv('FRED_API_KEY', '')  # Optional API key
            
            # FRED API URL (works without API key for public data, but rate limited)
            if fred_api_key:
                url = f"https://api.stlouisfed.org/fred/series/observations?series_id={fred_series_id}&api_key={fred_api_key}&file_type=json&limit=90&sort_order=desc"
            else:
                # Try without API key (may be rate limited)
                url = f"https://api.stlouisfed.org/fred/series/observations?series_id={fred_series_id}&file_type=json&limit=90&sort_order=desc"
            
            response = requests.get(url, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                observations = data.get('observations', [])
                
                if observations:
                    # Filter out missing values and convert to float
                    valid_obs = [obs for obs in observations if obs.get('value') != '.']
                    
                    if valid_obs:
                        # Get most recent value
                        current_price = float(valid_obs[0]['value'])
                        
                        # Calculate 30-day change (approximately, using available data points)
                        if len(valid_obs) >= 2:
                            # FRED data is monthly, so we'll use the previous month
                            price_change_30d = ((current_price / float(valid_obs[1]['value'])) - 1) * 100
                        else:
                            price_change_30d = 0
                        
                        # Build historical data (reverse to chronological order)
                        historical = []
                        for obs in reversed(valid_obs[:90]):  # Last 90 data points
                            try:
                                date_str = obs['date']
                                price = float(obs['value'])
                                historical.append({
                                    'date': date_str,
                                    'price': price
                                })
                            except:
                                continue
                        
                        return {
                            'current_price': current_price,
                            'price_change_30d': price_change_30d,
                            'source': 'FRED (PCU32733273)',
                            'historical': historical
                        }
        except Exception as e:
            print(f"Error fetching cement data from FRED: {e}")
            import traceback
            traceback.print_exc()
        
        # Fallback to construction ETF
        try:
            cement_proxy = yf.Ticker("XHB")
            data = cement_proxy.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                if len(data) >= 30:
                    price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                else:
                    price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                hist_data = historical[-90:] if len(historical) >= 90 else historical
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'XHB ETF (Construction proxy)',
                    'historical': hist_data
                }
        except Exception as e:
            print(f"Error fetching cement data: {e}")
        
        return None
    
    def fetch_aluminum_data(self):
        """Fetch aluminum price data from Trading Economics: https://tradingeconomics.com/commodity/aluminum"""
        try:
            # Use Trading Economics scraper
            data = self.trading_economics.fetch_commodity_data('aluminum')
            if data:
                return data
        except Exception as e:
            print(f"Error fetching aluminum data from Trading Economics: {e}")
        
        # Fallback to yfinance
        try:
            aluminum = yf.Ticker("ALI=F")
            data = aluminum.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                if len(data) >= 30:
                    price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                else:
                    price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                hist_data = historical[-90:] if len(historical) >= 90 else historical
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'Aluminum Futures (ALI=F)',
                    'historical': hist_data
                }
        except Exception as e:
            print(f"Error fetching aluminum data: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    
    def fetch_copper_data(self):
        """Fetch copper price data from Trading Economics: https://tradingeconomics.com/commodity/copper"""
        try:
            # Use Trading Economics scraper
            data = self.trading_economics.fetch_commodity_data('copper')
            if data:
                return data
        except Exception as e:
            print(f"Error fetching copper data from Trading Economics: {e}")
        
        # Fallback to yfinance
        try:
            copper = yf.Ticker("HG=F")
            data = copper.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                if len(data) >= 30:
                    price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                else:
                    price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                hist_data = historical[-90:] if len(historical) >= 90 else historical
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'Copper Futures (HG=F)',
                    'historical': hist_data
                }
        except Exception as e:
            print(f"Error fetching copper data: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    
    def fetch_rare_earths_data(self):
        """Fetch rare earth elements data from USGS: https://www.usgs.gov/media/files/rare-earths-historical-statistics-data-series-140"""
        try:
            # USGS provides historical statistics in Excel format
            # The file is at: https://www.usgs.gov/media/files/rare-earths-historical-statistics-data-series-140
            # For real-time data, we'll use USAR stock as proxy, but note the USGS source
            rare_earth = yf.Ticker("USAR")
            data = rare_earth.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                if len(data) >= 30:
                    price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                else:
                    price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                hist_data = historical[-90:] if len(historical) >= 90 else historical
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'USGS Historical Stats / USAR Stock (proxy)',
                    'historical': hist_data,
                    'note': 'Historical data available from USGS Data Series 140'
                }
        except Exception as e:
            print(f"Error fetching rare earth data: {e}")
            import traceback
            traceback.print_exc()
        
        return None
    
    def fetch_all_materials(self):
        """Fetch data for all materials in parallel."""
        print("Collecting material market data...")

        fetchers = {
            'steel': self.fetch_steel_data,
            'cement': self.fetch_cement_data,
            'aluminum': self.fetch_aluminum_data,
            'copper': self.fetch_copper_data,
            'rare_earths': self.fetch_rare_earths_data,
        }

        results = {}
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = {executor.submit(fn): name for name, fn in fetchers.items()}
            for future in as_completed(futures):
                name = futures[future]
                try:
                    results[name] = future.result()
                except Exception as e:
                    print(f"Error fetching {name}: {e}")
                    results[name] = None

        return results
    
    def get_news_based_metrics(self, material_id: str) -> Dict:
        """Get investment metrics from news scraping (cached daily)"""
        # Check if we have cached data from today
        if os.path.exists(self.news_cache_file):
            try:
                with open(self.news_cache_file, 'r') as f:
                    cache_data = json.load(f)
                    cache_date = datetime.fromisoformat(cache_data.get('date', ''))
                    
                    # If cache is from today, use it
                    if cache_date.date() == datetime.now().date():
                        return cache_data.get('materials', {}).get(material_id, {})
            except:
                pass
        
        # Scrape news for all materials (cache for the day)
        print("Scraping news articles for investment data...")
        try:
            news_data = self.news_scraper.scrape_all_materials()
            
            # Save to cache
            cache_data = {
                'date': datetime.now().isoformat(),
                'materials': news_data
            }
            with open(self.news_cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
            
            return news_data.get(material_id, {})
        except Exception as e:
            print(f"Error scraping news: {e}")
            return {}
    
    def calculate_investment_metrics(self, material_data, material_id=None):
        """Calculate investment gap and funding metrics based on market data and news"""
        # First, try to get news-based metrics if material_id is provided
        if material_id:
            news_metrics = self.get_news_based_metrics(material_id)
            
            # Use news data if available, otherwise fall back to market-based calculation
            if news_metrics and 'investment_gap' in news_metrics:
                return {
                    'investment_gap': news_metrics.get('investment_gap', 85),
                    'recent_funding': news_metrics.get('recent_funding', 15),
                    'market_sentiment': 'positive' if news_metrics.get('recent_funding', 0) > 20 else 'neutral',
                    'source': 'news_scraping',
                    'articles_analyzed': news_metrics.get('articles_analyzed', 0),
                    'timestamp': news_metrics.get('timestamp', datetime.now().isoformat())
                }
        
        # Fallback to market-based calculation
        if not material_data:
            return {
                'investment_gap': 100,
                'recent_funding': 25,
                'market_sentiment': 'neutral',
                'source': 'default'
            }
        
        # Use price change as indicator of market activity
        price_change = material_data.get('price_change_30d', 0)
        
        # Higher price increases = more investment activity = lower gap
        # Lower price = higher gap (less investment)
        if price_change > 5:
            investment_gap = 70  # Strong market
            recent_funding = 40
            sentiment = 'positive'
        elif price_change > 0:
            investment_gap = 85
            recent_funding = 30
            sentiment = 'moderate'
        elif price_change > -5:
            investment_gap = 100
            recent_funding = 25
            sentiment = 'neutral'
        else:
            investment_gap = 120  # Weak market
            recent_funding = 15
            sentiment = 'negative'
        
        return {
            'investment_gap': investment_gap,
            'recent_funding': recent_funding,
            'market_sentiment': sentiment,
            'price_change': price_change,
            'current_price': material_data.get('current_price', 0),
            'source': 'market_data'
        }
