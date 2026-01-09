# Data Center Demand Predictor

A machine learning system that predicts data center demand based on multiple economic and market indicators.

## Features

- **Multi-source Data Collection**:
  - Copper prices (Trading Economics / Yahoo Finance)
  - Energy ETF prices (iShares Energy ETF)
  - Power availability indicators
  - Tech company stock prices (Meta, Google, Microsoft, Apple, Amazon)

- **Advanced ML Models**:
  - Random Forest
  - Gradient Boosting
  - XGBoost
  - LightGBM
  - Automatically selects best performing model

- **RESTful API** for predictions and data access

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the pipeline:
```bash
python run_pipeline.py
```

This will:
- Collect data from all sources
- Train the ML model
- Start the API server on port 5000

## API Endpoints

### Health Check
```
GET /api/health
```

### Collect Data
```
POST /api/collect-data
Body: {"days": 365}
```

### Train Model
```
POST /api/train-model
```

### Get Prediction
```
POST /api/predict
Body: {"data": [...]}  # Optional, uses latest data if not provided
```

### Predict Future
```
POST /api/predict-future
Body: {"days": 30}
```

### Get Latest Data
```
GET /api/latest-data
```

## Project Structure

```
data-center-predictor/
├── data_collectors/
│   ├── copper_collector.py
│   ├── energy_collector.py
│   ├── tech_stocks_collector.py
│   └── data_aggregator.py
├── ml_model/
│   ├── train_model.py
│   ├── predictor.py
│   └── models/  # Trained models stored here
├── api/
│   └── app.py
├── data/  # Collected data stored here
├── requirements.txt
├── run_pipeline.py
└── README.md
```

## Model Performance

The system automatically trains multiple models and selects the best one based on RMSE. Typical performance:
- R² Score: > 0.85
- RMSE: Optimized for each dataset

## Notes

- Data collection uses yfinance for reliable stock/commodity data
- Models are retrained when new data is collected
- Predictions are based on historical patterns and current market conditions
