"""
Scraper for Trading Economics commodity data
"""
import requests
from bs4 import BeautifulSoup
import re
import pandas as pd
from datetime import datetime, timedelta
import time

class TradingEconomicsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_commodity_data(self, commodity: str):
        """
        Fetch commodity price data from Trading Economics
        Args:
            commodity: 'copper', 'aluminum', or 'steel'
        Returns:
            dict with current_price, price_change_30d, historical data
        """
        url = f"https://tradingeconomics.com/commodity/{commodity}"
        
        try:
            response = requests.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to extract price from various possible locations
            current_price = None
            price_change = None
            
            # Method 1: Look for price in script tags (Trading Economics often uses JSON-LD or inline scripts)
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string:
                    # Look for price patterns in JSON data
                    # Trading Economics often has data like: "value": 4.25 or "price": 4.25
                    price_patterns = [
                        r'"value"\s*:\s*([\d,]+\.?\d*)',
                        r'"price"\s*:\s*([\d,]+\.?\d*)',
                        r'price["\']?\s*[:=]\s*([\d,]+\.?\d*)',
                    ]
                    for pattern in price_patterns:
                        matches = re.findall(pattern, script.string, re.IGNORECASE)
                        if matches:
                            try:
                                price_str = matches[0].replace(',', '')
                                current_price = float(price_str)
                                break
                            except:
                                continue
                    if current_price:
                        break
            
            # Method 2: Look for price in specific div/span elements
            if not current_price:
                price_elements = soup.find_all(['span', 'div', 'td'], class_=lambda x: x and ('price' in str(x).lower() or 'value' in str(x).lower()))
                for elem in price_elements:
                    text = elem.get_text(strip=True)
                    # Look for dollar amounts or numbers
                    price_match = re.search(r'([\d,]+\.?\d*)', text.replace(',', ''))
                    if price_match:
                        try:
                            price_val = float(price_match.group(1))
                            # Reasonable price range check (adjust based on commodity)
                            if 0.1 < price_val < 100000:
                                current_price = price_val
                                break
                        except:
                            continue
            
            # Fallback: Use yfinance for commodity futures
            if not current_price:
                import yfinance as yf
                ticker_map = {
                    'copper': 'HG=F',
                    'aluminum': 'ALI=F',
                    'steel': 'SLX'  # Steel ETF as proxy
                }
                ticker = ticker_map.get(commodity)
                if ticker:
                    try:
                        stock = yf.Ticker(ticker)
                        data = stock.history(period="1d")
                        if not data.empty:
                            current_price = float(data['Close'].iloc[-1])
                    except:
                        pass
            
            # Get historical data (last 90 days) using yfinance as reliable source
            historical = []
            try:
                import yfinance as yf
                ticker_map = {
                    'copper': 'HG=F',
                    'aluminum': 'ALI=F',
                    'steel': 'SLX'
                }
                ticker = ticker_map.get(commodity)
                if ticker:
                    stock = yf.Ticker(ticker)
                    data = stock.history(period="1y")
                    
                    if not data.empty:
                        # Update current_price if we got it from yfinance
                        if not current_price:
                            current_price = float(data['Close'].iloc[-1])
                        
                        # Calculate 30-day change
                        if len(data) >= 30:
                            price_change_30d = ((current_price / data['Close'].iloc[-30]) - 1) * 100
                        else:
                            price_change_30d = ((current_price / data['Close'].iloc[0]) - 1) * 100 if len(data) > 1 else 0
                        
                        # Build historical data
                        for date, row in data.iterrows():
                            historical.append({
                                'date': date.strftime('%Y-%m-%d'),
                                'price': float(row['Close'])
                            })
                        
                        # Return last 90 days
                        hist_data = historical[-90:] if len(historical) >= 90 else historical
                        
                        return {
                            'current_price': current_price,
                            'price_change_30d': price_change_30d,
                            'source': f'Trading Economics / {ticker}',
                            'historical': hist_data
                        }
            except Exception as e:
                print(f"Error fetching historical data for {commodity}: {e}")
            
            # If we have current price but no historical, return what we have
            if current_price:
                return {
                    'current_price': current_price,
                    'price_change_30d': 0,
                    'source': 'Trading Economics',
                    'historical': []
                }
            
        except Exception as e:
            print(f"Error fetching {commodity} data from Trading Economics: {e}")
            import traceback
            traceback.print_exc()
        
        return None
