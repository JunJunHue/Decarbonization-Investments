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

class MaterialDataCollector:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def fetch_steel_data(self):
        """Fetch steel data from FRED API or use proxy indicators"""
        try:
            # Use steel-related ETFs and stocks as proxy
            # Steel ETF: SLX, or individual steel companies
            steel_etf = yf.Ticker("SLX")  # VanEck Steel ETF
            data = steel_etf.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                price_change_30d = ((current_price / data['Close'].iloc[-30 if len(data) > 30 else 0]) - 1) * 100 if len(data) > 30 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'SLX ETF (Steel proxy)',
                    'historical': historical[-90:]  # Last 90 days
                }
        except Exception as e:
            print(f"Error fetching steel data: {e}")
        
        return None
    
    def fetch_cement_data(self):
        """Fetch cement/concrete data from Trading Economics"""
        try:
            # Use construction materials ETF as proxy
            # IYR (Real Estate ETF) or XHB (Homebuilders) as proxy for construction demand
            cement_proxy = yf.Ticker("XHB")  # SPDR Homebuilders ETF
            data = cement_proxy.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                price_change_30d = ((current_price / data['Close'].iloc[-30 if len(data) > 30 else 0]) - 1) * 100 if len(data) > 30 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'XHB ETF (Construction proxy)',
                    'historical': historical[-90:]  # Last 90 days
                }
        except Exception as e:
            print(f"Error fetching cement data: {e}")
        
        return None
    
    def fetch_aluminum_data(self):
        """Fetch aluminum price data"""
        try:
            # Aluminum futures: ALI=F
            aluminum = yf.Ticker("ALI=F")
            data = aluminum.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                price_change_30d = ((current_price / data['Close'].iloc[-30 if len(data) > 30 else 0]) - 1) * 100 if len(data) > 30 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'Aluminum Futures (ALI=F)',
                    'historical': historical[-90:]  # Last 90 days
                }
        except Exception as e:
            print(f"Error fetching aluminum data: {e}")
        
        return None
    
    def fetch_copper_data(self):
        """Fetch copper price data"""
        try:
            # Copper futures: HG=F
            copper = yf.Ticker("HG=F")
            data = copper.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                price_change_30d = ((current_price / data['Close'].iloc[-30 if len(data) > 30 else 0]) - 1) * 100 if len(data) > 30 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'Copper Futures (HG=F)',
                    'historical': historical[-90:]  # Last 90 days
                }
        except Exception as e:
            print(f"Error fetching copper data: {e}")
        
        return None
    
    def fetch_rare_earths_data(self):
        """Fetch rare earth elements data from USAR stock"""
        try:
            # USAR - USA Rare Earth stock
            rare_earth = yf.Ticker("USAR")
            data = rare_earth.history(period="1y")
            
            if not data.empty:
                current_price = float(data['Close'].iloc[-1])
                price_change_30d = ((current_price / data['Close'].iloc[-30 if len(data) > 30 else 0]) - 1) * 100 if len(data) > 30 else 0
                
                # Get historical prices for charting
                historical = []
                for date, row in data.iterrows():
                    historical.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'price': float(row['Close'])
                    })
                
                return {
                    'current_price': current_price,
                    'price_change_30d': price_change_30d,
                    'source': 'USAR Stock (USA Rare Earth)',
                    'historical': historical[-90:]  # Last 90 days
                }
        except Exception as e:
            print(f"Error fetching rare earth data: {e}")
        
        return None
    
    def fetch_all_materials(self):
        """Fetch data for all materials"""
        print("Collecting material market data...")
        
        materials_data = {
            'steel': self.fetch_steel_data(),
            'cement': self.fetch_cement_data(),
            'aluminum': self.fetch_aluminum_data(),
            'copper': self.fetch_copper_data(),
            'rare_earths': self.fetch_rare_earths_data()
        }
        
        # Add small delay between requests
        time.sleep(0.5)
        
        return materials_data
    
    def calculate_investment_metrics(self, material_data):
        """Calculate investment gap and funding metrics based on market data"""
        if not material_data:
            return {
                'investment_gap': 100,
                'recent_funding': 25,
                'market_sentiment': 'neutral'
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
            'current_price': material_data.get('current_price', 0)
        }
