"""
Copper price data collector from Trading Economics
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime
import time
import json

class CopperCollector:
    def __init__(self):
        self.base_url = "https://tradingeconomics.com/commodity/copper"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_current_price(self):
        """Fetch current copper price"""
        try:
            response = requests.get(self.base_url, headers=self.headers, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Try to find price in various possible locations
            price_elements = soup.find_all(['span', 'div'], class_=lambda x: x and ('price' in x.lower() or 'value' in x.lower()))
            
            # Alternative: look for specific data attributes
            price_data = soup.find('span', {'data-id': 'copper'})
            
            # Try to extract from script tags (many sites use this)
            scripts = soup.find_all('script')
            for script in scripts:
                if script.string and 'copper' in script.string.lower():
                    # Look for price patterns
                    import re
                    price_match = re.search(r'\$?([\d,]+\.?\d*)', script.string)
                    if price_match:
                        price_str = price_match.group(1).replace(',', '')
                        try:
                            return float(price_str)
                        except:
                            continue
            
            # Fallback: use yfinance for copper futures
            import yfinance as yf
            copper = yf.Ticker("HG=F")  # Copper futures
            data = copper.history(period="1d")
            if not data.empty:
                return float(data['Close'].iloc[-1])
            
            return None
        except Exception as e:
            print(f"Error fetching copper price: {e}")
            # Fallback to yfinance
            try:
                import yfinance as yf
                copper = yf.Ticker("HG=F")
                data = copper.history(period="1d")
                if not data.empty:
                    return float(data['Close'].iloc[-1])
            except:
                pass
            return None
    
    def fetch_historical_data(self, days=365):
        """Fetch historical copper price data"""
        try:
            import yfinance as yf
            copper = yf.Ticker("HG=F")  # Copper futures
            data = copper.history(period=f"{days}d")
            
            if data.empty:
                return None
            
            # Convert to list of dicts
            historical = []
            for date, row in data.iterrows():
                historical.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'price': float(row['Close']),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'volume': int(row['Volume'])
                })
            
            return historical
        except Exception as e:
            print(f"Error fetching historical copper data: {e}")
            return None
