"""
Flask API for data center demand predictions
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import sys
import os

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_collectors.data_aggregator import DataAggregator
from data_collectors.material_data_collector import MaterialDataCollector
from ml_model.predictor import Predictor
from ml_model.train_model import DataCenterDemandPredictor
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Initialize components
aggregator = DataAggregator()
material_collector = MaterialDataCollector()
predictor = None

def load_predictor():
    """Load the predictor model"""
    global predictor
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        predictor = Predictor(model_dir=os.path.join(base_dir, 'ml_model', 'models'))
    except Exception as e:
        print(f"Warning: Could not load predictor: {e}")

# Try to load predictor on startup
load_predictor()

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'predictor_loaded': predictor is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/collect-data', methods=['POST'])
def collect_data():
    """Trigger data collection"""
    try:
        days = request.json.get('days', 365) if request.json else 365
        data = aggregator.collect_all_data(days=days)
        
        return jsonify({
            'status': 'success',
            'message': 'Data collected successfully',
            'rows': len(data),
            'columns': list(data.columns),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/train-model', methods=['POST'])
def train_model():
    """Train the ML model"""
    try:
        trainer = DataCenterDemandPredictor()
        
        # Get data path if provided
        data_path = request.json.get('data_path') if request.json else None
        
        # Train model
        best_model, best_name, metadata = trainer.train_models(data_path=data_path)
        
        # Reload predictor
        load_predictor()
        
        return jsonify({
            'status': 'success',
            'message': 'Model trained successfully',
            'best_model': best_name,
            'metadata': metadata
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """Make prediction"""
    if predictor is None:
        return jsonify({
            'status': 'error',
            'message': 'Predictor model not loaded. Please train the model first.'
        }), 400
    
    try:
        # Get input data
        input_data = request.json
        
        if 'data' in input_data:
            # Direct data input
            df = pd.DataFrame(input_data['data'])
            df.set_index('date', inplace=True)
        else:
            # Use latest collected data
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_dir = os.path.join(base_dir, 'data')
            json_file = os.path.join(data_dir, 'latest_data.json')
            
            if not os.path.exists(json_file):
                return jsonify({
                    'status': 'error',
                    'message': 'No data available. Please collect data first.'
                }), 400
            
            df = pd.read_json(json_file)
            df['date'] = pd.to_datetime(df['date'])
            df.set_index('date', inplace=True)
        
        # Make prediction
        prediction = predictor.predict(df.iloc[[-1]])
        
        return jsonify({
            'status': 'success',
            'prediction': float(prediction[0]),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/predict-future', methods=['POST'])
def predict_future():
    """Predict future demand"""
    if predictor is None:
        return jsonify({
            'status': 'error',
            'message': 'Predictor model not loaded. Please train the model first.'
        }), 400
    
    try:
        days_ahead = request.json.get('days', 30) if request.json else 30
        
        # Load latest data
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, 'data')
        json_file = os.path.join(data_dir, 'latest_data.json')
        
        if not os.path.exists(json_file):
            return jsonify({
                'status': 'error',
                'message': 'No data available. Please collect data first.'
            }), 400
        
        df = pd.read_json(json_file)
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)
        
        # Make future predictions
        predictions = predictor.predict_future(df, days_ahead=days_ahead)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions,
            'days_ahead': days_ahead,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/material-data', methods=['GET'])
def get_material_data():
    """Get real-time material market data"""
    try:
        materials_data = material_collector.fetch_all_materials()
        
        # Calculate investment metrics for each material
        result = {}
        for material_id, data in materials_data.items():
            if data:
                metrics = material_collector.calculate_investment_metrics(data)
                result[material_id] = {
                    'market_data': data,
                    'investment_metrics': metrics
                }
            else:
                # Default values if data unavailable
                result[material_id] = {
                    'market_data': None,
                    'investment_metrics': {
                        'investment_gap': 100,
                        'recent_funding': 25,
                        'market_sentiment': 'neutral'
                    }
                }
        
        return jsonify({
            'status': 'success',
            'materials': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/latest-data', methods=['GET'])
def get_latest_data():
    """Get latest collected data"""
    try:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, 'data')
        json_file = os.path.join(data_dir, 'latest_data.json')
        
        if not os.path.exists(json_file):
            return jsonify({
                'status': 'error',
                'message': 'No data available. Please collect data first.'
            }), 404
        
        import json
        with open(json_file, 'r') as f:
            data = json.load(f)
        
        return jsonify({
            'status': 'success',
            'data': data[-100:],  # Return last 100 records
            'total_records': len(data),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
