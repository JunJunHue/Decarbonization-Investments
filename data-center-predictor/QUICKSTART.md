# Quick Start Guide

## Setup

1. **Install Python dependencies:**
```bash
cd data-center-predictor
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Run the pipeline:**
```bash
python run_pipeline.py
```

This will:
- Collect data from all sources (copper, energy, tech stocks)
- Train the ML model
- Start the API server on http://localhost:5001

## Using the Frontend

1. **Make sure the API is running** (from step 2 above)

2. **The frontend is already integrated** - just navigate to the "Demand Predictor" section in your React app

3. **To update predictions:**
   - Click "Collect & Train" to fetch new data and retrain the model
   - Click "Refresh Predictions" to get updated forecasts
   - Adjust the forecast period (7, 30, 60, or 90 days)

## API Endpoints

- `GET /api/health` - Check if API is running
- `POST /api/collect-data` - Collect new data
- `POST /api/train-model` - Train the ML model
- `POST /api/predict-future` - Get future predictions
- `GET /api/latest-data` - Get latest collected data

## Troubleshooting

**API not responding:**
- Make sure the Python server is running: `python run_pipeline.py`
- Check if port 5001 is available (port 5000 is often used by macOS AirPlay)
- Verify all dependencies are installed

**No predictions available:**
- Click "Collect & Train" to gather data and train the model
- This may take a few minutes on first run

**Data collection errors:**
- Some data sources may have rate limits
- The system uses fallback methods (yfinance) for reliable data
- Check your internet connection

## Model Performance

The system automatically:
- Trains multiple ML models (Random Forest, XGBoost, LightGBM, Gradient Boosting)
- Selects the best performing model
- Provides accuracy metrics (R², RMSE, MAE)

Typical performance: R² > 0.85
