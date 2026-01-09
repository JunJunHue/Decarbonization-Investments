"""
Make predictions using trained model
"""
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime, timedelta

class Predictor:
    def __init__(self, model_dir=None):
        if model_dir is None:
            # Use absolute path relative to project root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_dir = os.path.join(base_dir, "ml_model", "models")
        else:
            self.model_dir = model_dir
        self.model = None
        self.scaler = None
        self.feature_cols = None
        self.load_model()
    
    def load_model(self):
        """Load the trained model and scaler"""
        try:
            # Load best model
            model_path = os.path.join(self.model_dir, "best_model.pkl")
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
            else:
                raise FileNotFoundError("Model file not found")
            
            # Load scaler
            scaler_path = os.path.join(self.model_dir, "scaler.pkl")
            if os.path.exists(scaler_path):
                self.scaler = joblib.load(scaler_path)
            
            # Load feature columns
            feature_path = os.path.join(self.model_dir, "feature_cols.pkl")
            if os.path.exists(feature_path):
                self.feature_cols = joblib.load(feature_path)
            
            # Load metadata
            metadata_path = os.path.join(self.model_dir, "model_metadata.json")
            if os.path.exists(metadata_path):
                import json
                with open(metadata_path, 'r') as f:
                    self.metadata = json.load(f)
            else:
                self.metadata = {}
            
        except Exception as e:
            print(f"Error loading model: {e}")
            raise
    
    def prepare_features(self, df):
        """Prepare features from input dataframe"""
        if self.feature_cols is None:
            raise ValueError("Feature columns not loaded")
        
        # Ensure all required features are present
        missing_features = set(self.feature_cols) - set(df.columns)
        if missing_features:
            # Fill missing features with 0 or mean
            for feat in missing_features:
                df[feat] = 0
        
        # Select only required features
        features = df[self.feature_cols]
        
        return features
    
    def predict(self, df):
        """Make prediction for given data"""
        if self.model is None:
            raise ValueError("Model not loaded")
        
        # Prepare features
        features = self.prepare_features(df)
        
        # Scale if needed (check if model needs scaling)
        if self.scaler is not None and self.metadata.get('best_model') not in ['xgboost', 'lightgbm']:
            features_scaled = self.scaler.transform(features)
            prediction = self.model.predict(features_scaled)
        else:
            prediction = self.model.predict(features)
        
        return prediction
    
    def predict_future(self, latest_data, days_ahead=30):
        """Predict future data center demand"""
        # Use latest data and project forward
        predictions = []
        
        # Start with latest data
        current_data = latest_data.copy()
        
        for i in range(days_ahead):
            # Make prediction for this day
            pred = self.predict(current_data.iloc[[-1]])
            predictions.append({
                'date': (pd.to_datetime(current_data.index[-1]) + timedelta(days=1)).strftime('%Y-%m-%d'),
                'predicted_demand': float(pred[0])
            })
            
            # Update current_data for next prediction (simple forward fill)
            # In a real scenario, you'd update with predicted values
            new_row = current_data.iloc[-1].copy()
            new_row.name = pd.to_datetime(current_data.index[-1]) + timedelta(days=1)
            current_data = pd.concat([current_data, new_row.to_frame().T])
        
        return predictions
