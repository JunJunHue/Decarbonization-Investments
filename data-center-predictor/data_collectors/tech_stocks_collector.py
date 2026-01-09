"""
Tech company stock data collector (Meta, Google, Microsoft, Apple, Amazon)
"""
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

class TechStocksCollector:
    def __init__(self):
        self.tickers = {
            'meta': 'META',
            'google': 'GOOGL',
            'microsoft': 'MSFT',
            'apple': 'AAPL',
            'amazon': 'AMZN'
        }
    
    def fetch_stock_data(self, ticker_symbol, days=365):
        """Fetch historical stock data for a ticker"""
        try:
            stock = yf.Ticker(ticker_symbol)
            data = stock.history(period=f"{days}d")
            
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
                    'volume': int(row['Volume']),
                    'market_cap': float(row['Close']) * stock.info.get('sharesOutstanding', 0) if 'sharesOutstanding' in stock.info else None
                })
            
            return historical
        except Exception as e:
            print(f"Error fetching stock data for {ticker_symbol}: {e}")
            return None
    
    def fetch_all_stocks(self, days=365):
        """Fetch data for all tech companies"""
        all_data = {}
        
        for company, ticker in self.tickers.items():
            print(f"Fetching data for {company} ({ticker})...")
            data = self.fetch_stock_data(ticker, days)
            if data:
                all_data[company] = data
            # Small delay to avoid rate limiting
            import time
            time.sleep(0.5)
        
        return all_data
    
    def get_current_prices(self):
        """Get current stock prices"""
        current_prices = {}
        
        for company, ticker in self.tickers.items():
            try:
                stock = yf.Ticker(ticker)
                info = stock.info
                current_prices[company] = {
                    'price': info.get('currentPrice', info.get('regularMarketPrice', None)),
                    'market_cap': info.get('marketCap', None),
                    'volume': info.get('volume', None),
                    'pe_ratio': info.get('trailingPE', None)
                }
            except Exception as e:
                print(f"Error fetching current price for {ticker}: {e}")
                current_prices[company] = None
        
        return current_prices
