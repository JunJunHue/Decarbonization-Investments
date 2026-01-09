"""
Aggregates data from all collectors and creates a unified dataset
"""
import pandas as pd
from datetime import datetime, timedelta
from .copper_collector import CopperCollector
from .energy_collector import EnergyCollector
from .tech_stocks_collector import TechStocksCollector
import json
import os

class DataAggregator:
    def __init__(self):
        self.copper_collector = CopperCollector()
        self.energy_collector = EnergyCollector()
        self.tech_collector = TechStocksCollector()
        # Use absolute path relative to project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.data_dir = os.path.join(base_dir, "data")
        os.makedirs(self.data_dir, exist_ok=True)
    
    def collect_all_data(self, days=365):
        """Collect data from all sources"""
        print("Starting data collection...")
        
        # Collect copper data
        print("Collecting copper data...")
        copper_historical = self.copper_collector.fetch_historical_data(days)
        copper_current = self.copper_collector.fetch_current_price()
        
        # Collect energy ETF data
        print("Collecting energy ETF data...")
        energy_historical = self.energy_collector.fetch_etf_data(days)
        power_data = self.energy_collector.fetch_power_availability()
        
        # Collect tech stocks data
        print("Collecting tech stocks data...")
        tech_stocks = self.tech_collector.fetch_all_stocks(days)
        tech_current = self.tech_collector.get_current_prices()
        
        # Aggregate into unified dataset
        aggregated_data = self._create_unified_dataset(
            copper_historical, copper_current,
            energy_historical, power_data,
            tech_stocks, tech_current
        )
        
        # Save to file
        self._save_data(aggregated_data)
        
        return aggregated_data
    
    def _create_unified_dataset(self, copper_hist, copper_curr, energy_hist, power_data, tech_stocks, tech_current):
        """Create a unified dataset with all features"""
        
        # Convert all to DataFrames
        dfs = []
        
        # Copper data
        if copper_hist:
            copper_df = pd.DataFrame(copper_hist)
            copper_df['date'] = pd.to_datetime(copper_df['date'])
            copper_df = copper_df.rename(columns={'price': 'copper_price'})
            dfs.append(copper_df.set_index('date')[['copper_price']])
        
        # Energy ETF data
        if energy_hist:
            energy_df = pd.DataFrame(energy_hist)
            energy_df['date'] = pd.to_datetime(energy_df['date'])
            energy_df = energy_df.rename(columns={'close': 'energy_etf_price'})
            dfs.append(energy_df.set_index('date')[['energy_etf_price']])
        
        # Tech stocks - aggregate (average or weighted)
        if tech_stocks:
            tech_dfs = []
            for company, data in tech_stocks.items():
                if data:
                    tech_df = pd.DataFrame(data)
                    tech_df['date'] = pd.to_datetime(tech_df['date'])
                    tech_df = tech_df.rename(columns={'close': f'{company}_price'})
                    tech_dfs.append(tech_df.set_index('date')[[f'{company}_price']])
            
            if tech_dfs:
                # Merge all tech stocks
                tech_combined = tech_dfs[0]
                for df in tech_dfs[1:]:
                    tech_combined = tech_combined.join(df, how='outer')
                
                # Calculate average tech stock price
                tech_combined['avg_tech_price'] = tech_combined.mean(axis=1)
                dfs.append(tech_combined[['avg_tech_price']])
        
        # Merge all dataframes
        if dfs:
            unified_df = dfs[0]
            for df in dfs[1:]:
                unified_df = unified_df.join(df, how='outer')
            
            # Forward fill missing values
            unified_df = unified_df.ffill().bfill()
            
            # Add derived features
            unified_df = self._add_features(unified_df)
            
            return unified_df
        else:
            return pd.DataFrame()
    
    def _add_features(self, df):
        """Add derived features for ML model"""
        # Moving averages
        for col in df.columns:
            if 'price' in col.lower():
                df[f'{col}_ma7'] = df[col].rolling(window=7).mean()
                df[f'{col}_ma30'] = df[col].rolling(window=30).mean()
                df[f'{col}_ma90'] = df[col].rolling(window=90).mean()
                
                # Price changes
                df[f'{col}_change'] = df[col].pct_change()
                df[f'{col}_change_7d'] = df[col].pct_change(periods=7)
                df[f'{col}_change_30d'] = df[col].pct_change(periods=30)
        
        # Volatility
        for col in df.columns:
            if 'price' in col.lower() and 'change' not in col:
                df[f'{col}_volatility'] = df[col].rolling(window=30).std()
        
        # Fill NaN values
        df = df.ffill().bfill().fillna(0)
        
        return df
    
    def _save_data(self, data):
        """Save aggregated data to file"""
        filepath = os.path.join(self.data_dir, f"aggregated_data_{datetime.now().strftime('%Y%m%d')}.csv")
        data.to_csv(filepath)
        print(f"Data saved to {filepath}")
        
        # Also save as JSON for API
        json_filepath = os.path.join(self.data_dir, "latest_data.json")
        data.reset_index().to_json(json_filepath, date_format='iso', orient='records')
        print(f"Data also saved to {json_filepath}")
