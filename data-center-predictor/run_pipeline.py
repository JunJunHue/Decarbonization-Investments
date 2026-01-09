"""
Main pipeline script to collect data, train model, and start API
"""
import os
import sys
from data_collectors.data_aggregator import DataAggregator
from ml_model.train_model import DataCenterDemandPredictor

def main():
    print("=" * 60)
    print("Data Center Demand Predictor Pipeline")
    print("=" * 60)
    
    # Step 1: Collect data
    print("\n[1/3] Collecting data from all sources...")
    aggregator = DataAggregator()
    try:
        data = aggregator.collect_all_data(days=365)
        print(f"✓ Collected {len(data)} data points")
    except Exception as e:
        print(f"✗ Error collecting data: {e}")
        return
    
    # Step 2: Train model
    print("\n[2/3] Training ML model...")
    trainer = DataCenterDemandPredictor()
    try:
        best_model, best_name, metadata = trainer.train_models(df=data)
        print(f"✓ Model trained: {best_name}")
        print(f"  RMSE: {metadata['rmse']:.2f}")
        print(f"  R²: {metadata['r2']:.4f}")
    except Exception as e:
        print(f"✗ Error training model: {e}")
        return
    
    # Step 3: Start API
    print("\n[3/3] Starting API server...")
    print("API will be available at http://localhost:5001")
    print("Endpoints:")
    print("  - GET  /api/health")
    print("  - POST /api/collect-data")
    print("  - POST /api/train-model")
    print("  - POST /api/predict")
    print("  - POST /api/predict-future")
    print("  - GET  /api/latest-data")
    
    # Import and run Flask app
    from api.app import app
    app.run(debug=True, port=5001, host='0.0.0.0')

if __name__ == '__main__':
    main()
