"""
Train ML model for data center demand prediction
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime, timedelta

# Try to import optional ML libraries
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except (ImportError, Exception) as e:
    XGBOOST_AVAILABLE = False
    print(f"Warning: XGBoost not available: {e}")
    print("To fix: Run 'brew install libomp' then reinstall xgboost")

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except (ImportError, Exception) as e:
    LIGHTGBM_AVAILABLE = False
    print(f"Warning: LightGBM not available: {e}")

class DataCenterDemandPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        # Use absolute path relative to project root
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_dir = os.path.join(base_dir, "ml_model", "models")
        os.makedirs(self.model_dir, exist_ok=True)
    
    def create_target_variable(self, df):
        """
        Create target variable: data center demand
        Since we don't have actual data center demand data,
        we'll create a synthetic target based on:
        - Tech stock prices (higher = more demand)
        - Copper prices (higher = more infrastructure demand)
        - Energy prices (lower = more feasible)
        - Time trends (exponential growth)
        """
        # Synthetic target: weighted combination of features
        # This simulates data center demand growth
        
        # Base growth trend (exponential)
        days = len(df)
        base_trend = np.exp(np.linspace(0, 2, days))  # Exponential growth
        
        # Tech stock influence (normalized)
        if 'avg_tech_price' in df.columns:
            tech_influence = (df['avg_tech_price'] / df['avg_tech_price'].iloc[0]) * 100
        else:
            tech_influence = pd.Series([100] * days, index=df.index)
        
        # Copper price influence (normalized)
        if 'copper_price' in df.columns:
            copper_influence = (df['copper_price'] / df['copper_price'].iloc[0]) * 50
        else:
            copper_influence = pd.Series([50] * days, index=df.index)
        
        # Energy price influence (inverse - lower energy = higher demand)
        if 'energy_etf_price' in df.columns:
            energy_influence = (df['energy_etf_price'].iloc[0] / df['energy_etf_price']) * 30
        else:
            energy_influence = pd.Series([30] * days, index=df.index)
        
        # Combine with noise
        target = (
            base_trend * 0.4 +
            tech_influence.values * 0.3 +
            copper_influence.values * 0.2 +
            energy_influence.values * 0.1
        )
        
        # Add some realistic noise
        noise = np.random.normal(0, target.std() * 0.05, len(target))
        target = target + noise
        
        return pd.Series(target, index=df.index)
    
    def prepare_features(self, df):
        """Prepare features for training"""
        # Select feature columns (exclude target-related)
        feature_cols = [col for col in df.columns if 'demand' not in col.lower()]
        
        # Remove highly correlated features
        corr_matrix = df[feature_cols].corr().abs()
        upper_tri = corr_matrix.where(
            np.triu(np.ones(corr_matrix.shape), k=1).astype(bool)
        )
        
        # Drop features with correlation > 0.95
        to_drop = [column for column in upper_tri.columns if any(upper_tri[column] > 0.95)]
        feature_cols = [col for col in feature_cols if col not in to_drop]
        
        return df[feature_cols], feature_cols
    
    def train_models(self, data_path=None, df=None):
        """Train multiple ML models and select the best"""
        
        # Load data
        if df is None:
            if data_path is None:
                # Find latest data file
                base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                data_dir = os.path.join(base_dir, "data")
                if not os.path.exists(data_dir):
                    raise ValueError(f"Data directory not found: {data_dir}")
                files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]
                if not files:
                    raise ValueError("No data files found")
                data_path = os.path.join(data_dir, sorted(files)[-1])
            
            df = pd.read_csv(data_path, index_col=0, parse_dates=True)
        
        # Create target variable
        print("Creating target variable...")
        target = self.create_target_variable(df)
        
        # Prepare features
        print("Preparing features...")
        features_df, feature_cols = self.prepare_features(df)
        
        # Combine features and target
        model_df = features_df.copy()
        model_df['data_center_demand'] = target
        
        # Remove rows with NaN
        model_df = model_df.dropna()
        
        if len(model_df) < 100:
            raise ValueError(f"Not enough data: {len(model_df)} rows")
        
        # Split data (time series split)
        split_idx = int(len(model_df) * 0.8)
        train_df = model_df.iloc[:split_idx]
        test_df = model_df.iloc[split_idx:]
        
        X_train = train_df[feature_cols]
        y_train = train_df['data_center_demand']
        X_test = test_df[feature_cols]
        y_test = test_df['data_center_demand']
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        self.scalers['main'] = scaler
        
        # Train multiple models
        models_to_train = {
            'random_forest': RandomForestRegressor(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.05,
                random_state=42
            )
        }
        
        # Add optional models if available
        if XGBOOST_AVAILABLE:
            models_to_train['xgboost'] = xgb.XGBRegressor(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.05,
                random_state=42,
                n_jobs=-1
            )
        
        if LIGHTGBM_AVAILABLE:
            models_to_train['lightgbm'] = lgb.LGBMRegressor(
                n_estimators=200,
                max_depth=10,
                learning_rate=0.05,
                random_state=42,
                n_jobs=-1,
                verbose=-1
            )
        
        best_model = None
        best_score = float('inf')
        best_name = None
        
        print("Training models...")
        for name, model in models_to_train.items():
            print(f"  Training {name}...")
            
            # Train
            if name in ['xgboost', 'lightgbm']:
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
            else:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
            
            # Evaluate
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            print(f"    MAE: {mae:.2f}, RMSE: {rmse:.2f}, R²: {r2:.4f}")
            
            # Save model
            model_path = os.path.join(self.model_dir, f"{name}_model.pkl")
            if name in ['xgboost', 'lightgbm']:
                joblib.dump(model, model_path)
            else:
                joblib.dump(model, model_path)
            
            self.models[name] = model
            
            # Track best model
            if rmse < best_score:
                best_score = rmse
                best_model = model
                best_name = name
        
        # Save best model and scaler
        print(f"\nBest model: {best_name} (RMSE: {best_score:.2f})")
        joblib.dump(best_model, os.path.join(self.model_dir, "best_model.pkl"))
        joblib.dump(self.scalers['main'], os.path.join(self.model_dir, "scaler.pkl"))
        joblib.dump(feature_cols, os.path.join(self.model_dir, "feature_cols.pkl"))
        
        # Save model metadata
        metadata = {
            'best_model': best_name,
            'rmse': float(best_score),
            'mae': float(mean_absolute_error(y_test, best_model.predict(X_test if best_name in ['xgboost', 'lightgbm'] else X_test_scaled))),
            'r2': float(r2_score(y_test, best_model.predict(X_test if best_name in ['xgboost', 'lightgbm'] else X_test_scaled))),
            'n_features': len(feature_cols),
            'n_samples': len(model_df),
            'train_size': len(train_df),
            'test_size': len(test_df),
            'trained_date': datetime.now().isoformat()
        }
        
        import json
        with open(os.path.join(self.model_dir, "model_metadata.json"), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        return best_model, best_name, metadata
