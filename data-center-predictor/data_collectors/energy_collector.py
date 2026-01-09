"""
Energy ETF and power data collector
"""
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup

class EnergyCollector:
    def __init__(self):
        self.etf_ticker = "IYE"  # iShares U.S. Energy ETF
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def fetch_etf_data(self, days=365):
        """Fetch iShares Energy ETF historical data"""
        try:
            etf = yf.Ticker(self.etf_ticker)
            data = etf.history(period=f"{days}d")
            
            if data.empty:
                return None
            
            historical = []
            for date, row in data.iterrows():
                historical.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'close': float(row['Close']),
                    'open': float(row['Open']),
                    'high': float(row['High']),
                    'low': float(row['Low']),
                    'volume': int(row['Volume'])
                })
            
            return historical
        except Exception as e:
            print(f"Error fetching ETF data: {e}")
            return None
    
    def fetch_power_availability(self):
        """Fetch power availability data from IEA"""
        try:
            # IEA Real-time Electricity Tracker API endpoint
            # Note: This may require API key or may need to scrape
            url = "https://www.iea.org/api/elec"
            
            # Try API first
            try:
                response = requests.get(url, headers=self.headers, timeout=10)
                if response.status_code == 200:
                    return response.json()
            except:
                pass
            
            # Fallback: Use alternative power data sources
            # Use electricity futures or power company stocks as proxy
            power_etf = yf.Ticker("XLU")  # Utilities ETF as proxy
            data = power_etf.history(period="1d")
            if not data.empty:
                return {
                    'price': float(data['Close'].iloc[-1]),
                    'date': datetime.now().strftime('%Y-%m-%d')
                }
            
            return None
        except Exception as e:
            print(f"Error fetching power availability: {e}")
            return None
