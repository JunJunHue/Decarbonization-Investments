"""
Flask API for data center demand predictions
"""
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import sys
import os
import json

# Add parent directories to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_collectors.data_aggregator import DataAggregator
from data_collectors.material_data_collector import MaterialDataCollector
from data_collectors.ticker_collector import TickerCollector
from data_collectors.ticker_registry import TICKER_UNIVERSE, SECTOR_LABELS, DEMAND_WEIGHTS, THEMATIC_SIGNALS
from ml_model.predictor import Predictor
from ml_model.train_model import DataCenterDemandPredictor
from ml_model.monte_carlo import MonteCarloSimulator, simulation_result_to_dict, SCENARIOS
from ml_model.material_requirements import compute_requirements_for_scenario, MATERIAL_INTENSITY, MATERIAL_ORDER
from ml_model.fund_sizing import compute_fund_sizing, build_narrative
import pandas as pd
from datetime import datetime
import schedule
import threading
import time

app = Flask(__name__)
CORS(app)

# Initialize components
aggregator = DataAggregator()
material_collector = MaterialDataCollector()
ticker_collector = TickerCollector()
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
    """Predict future demand (monthly forecasts)"""
    if predictor is None:
        return jsonify({
            'status': 'error',
            'message': 'Predictor model not loaded. Please train the model first.'
        }), 400
    
    try:
        # Accept months instead of days
        months_ahead = request.json.get('months', 6) if request.json else 6
        days_ahead = months_ahead * 30  # Convert months to approximate days for prediction
        
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
        
        # Make future predictions (daily granularity internally)
        daily_predictions = predictor.predict_future(df, days_ahead=days_ahead)
        
        # Aggregate to monthly predictions
        monthly_predictions = []
        if daily_predictions:
            # Group predictions by month
            df_pred = pd.DataFrame(daily_predictions)
            df_pred['date'] = pd.to_datetime(df_pred['date'])
            df_pred.set_index('date', inplace=True)
            
            # Resample to monthly, taking the last value of each month (or average)
            monthly_df = df_pred.resample('M').last().reset_index()
            
            # Convert to list of dicts
            for _, row in monthly_df.iterrows():
                monthly_predictions.append({
                    'date': row['date'].strftime('%Y-%m-%d'),
                    'predicted_demand': float(row['predicted_demand']),
                    'month': row['date'].strftime('%B %Y')
                })
        
        return jsonify({
            'status': 'success',
            'predictions': monthly_predictions,
            'months_ahead': months_ahead,
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
                # Pass material_id to calculate_investment_metrics for news scraping
                metrics = material_collector.calculate_investment_metrics(data, material_id)
                result[material_id] = {
                    'market_data': data,
                    'investment_metrics': metrics
                }
            else:
                # Try to get news-based metrics even without market data
                news_metrics = material_collector.get_news_based_metrics(material_id)
                if news_metrics:
                    result[material_id] = {
                        'market_data': None,
                        'investment_metrics': {
                            'investment_gap': news_metrics.get('investment_gap', 85),
                            'recent_funding': news_metrics.get('recent_funding', 15),
                            'market_sentiment': 'positive' if news_metrics.get('recent_funding', 0) > 20 else 'neutral',
                            'source': 'news_scraping'
                        }
                    }
                else:
                    # Default values if data unavailable
                    result[material_id] = {
                        'market_data': None,
                        'investment_metrics': {
                            'investment_gap': 100,
                            'recent_funding': 25,
                            'market_sentiment': 'neutral',
                            'source': 'default'
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

@app.route('/api/tickers', methods=['GET'])
def get_tickers():
    """Return all tracked tickers with live price data, organised by sector."""
    try:
        sector = request.args.get('sector')
        period = request.args.get('period', '3mo')
        force = request.args.get('force', 'false').lower() == 'true'

        if sector:
            data = ticker_collector.fetch_sector(sector, period=period)
        else:
            data = ticker_collector.fetch_all(period=period, force_refresh=force)

        sector_momentum = ticker_collector.compute_sector_momentum(data)
        thematic_signals = ticker_collector.compute_thematic_signals(data)
        demand_index = ticker_collector.compute_demand_index(data)

        return jsonify({
            'status': 'success',
            'tickers': data,
            'sector_momentum': sector_momentum,
            'thematic_signals': thematic_signals,
            'demand_index': demand_index,
            'sector_labels': SECTOR_LABELS,
            'ticker_count': len(data),
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/tickers/<symbol>', methods=['GET'])
def get_ticker(symbol: str):
    """Return detail for a single ticker."""
    try:
        period = request.args.get('period', '3mo')
        data = ticker_collector.fetch_all(period=period)
        ticker_data = data.get(symbol.upper())
        if not ticker_data:
            return jsonify({'status': 'error', 'message': f'Ticker {symbol} not found'}), 404
        return jsonify({'status': 'success', 'ticker': ticker_data, 'timestamp': datetime.now().isoformat()})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/sector-momentum', methods=['GET'])
def get_sector_momentum():
    """Return 30d momentum score per sector and thematic signals."""
    try:
        data = ticker_collector.fetch_all()
        sector_momentum = ticker_collector.compute_sector_momentum(data)
        thematic_signals = ticker_collector.compute_thematic_signals(data)
        demand_index = ticker_collector.compute_demand_index(data)
        return jsonify({
            'status': 'success',
            'sector_momentum': sector_momentum,
            'thematic_signals': thematic_signals,
            'demand_index': demand_index,
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/correlation-matrix', methods=['GET'])
def get_correlation_matrix():
    """Return correlation matrix of demand driver tickers."""
    try:
        period = request.args.get('period', '1y')
        hist = ticker_collector.get_historical_for_simulation(period=period)
        if hist.empty:
            return jsonify({'status': 'error', 'message': 'No historical data'}), 500

        corr = hist.corr()
        tickers = list(corr.columns)
        matrix = corr.values.tolist()

        return jsonify({
            'status': 'success',
            'tickers': tickers,
            'matrix': matrix,
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Run Monte Carlo simulation for data center demand.
    Body: { months_ahead: int, n_simulations: int, scenario: str }
    """
    try:
        body = request.json or {}
        months_ahead = int(body.get('months_ahead', 12))
        n_simulations = int(body.get('n_simulations', 10000))
        scenario = body.get('scenario', 'base')

        hist = ticker_collector.get_historical_for_simulation(period='1y')
        if hist.empty:
            return jsonify({'status': 'error', 'message': 'No historical data for simulation'}), 500

        simulator = MonteCarloSimulator(n_simulations=n_simulations)
        result = simulator.simulate(hist, months_ahead=months_ahead, scenario=scenario)

        return jsonify({
            'status': 'success',
            'simulation': simulation_result_to_dict(result),
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/simulate-scenarios', methods=['POST'])
def simulate_scenarios():
    """
    Run all 6 pre-built scenarios and return results for comparison.
    Body: { months_ahead: int, n_simulations: int }
    """
    try:
        body = request.json or {}
        months_ahead = int(body.get('months_ahead', 12))
        n_simulations = int(body.get('n_simulations', 5000))  # lower default for speed

        hist = ticker_collector.get_historical_for_simulation(period='1y')
        if hist.empty:
            return jsonify({'status': 'error', 'message': 'No historical data for simulation'}), 500

        simulator = MonteCarloSimulator(n_simulations=n_simulations)
        all_results = simulator.simulate_all_scenarios(hist, months_ahead=months_ahead)

        return jsonify({
            'status': 'success',
            'scenarios': {
                name: simulation_result_to_dict(res)
                for name, res in all_results.items()
            },
            'scenario_descriptions': {k: v['description'] for k, v in SCENARIOS.items()},
            'months_ahead': months_ahead,
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/stream', methods=['GET'])
def stream():
    """
    Server-Sent Events endpoint for real-time ticker price updates.
    Pushes updates every 60 seconds.
    """
    def generate():
        while True:
            try:
                data = ticker_collector.fetch_all()
                demand_index = ticker_collector.compute_demand_index(data)
                sector_momentum = ticker_collector.compute_sector_momentum(data)
                payload = {
                    'type': 'ticker_update',
                    'demand_index': demand_index,
                    'sector_momentum': sector_momentum,
                    'ticker_count': len(data),
                    'timestamp': datetime.now().isoformat(),
                }
                yield f"data: {json.dumps(payload)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            time.sleep(60)

    return Response(generate(), mimetype='text/event-stream',
                    headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'})


@app.route('/api/material-requirements', methods=['POST'])
def material_requirements():
    """
    Run Monte Carlo simulation then translate demand index paths into
    specific material requirements (steel, cement, aluminum, copper, rare earths).

    Body: { months_ahead: int, n_simulations: int, scenario: str }
    Returns demand projections in GW + annual material tons + dollar value.
    """
    try:
        body = request.json or {}
        months_ahead = int(body.get('months_ahead', 24))
        n_simulations = int(body.get('n_simulations', 5000))
        scenario = body.get('scenario', 'base')

        hist = ticker_collector.get_historical_for_simulation(period='1y')
        if hist.empty:
            return jsonify({'status': 'error', 'message': 'No historical data for simulation'}), 500

        simulator = MonteCarloSimulator(n_simulations=n_simulations)
        result = simulator.simulate(hist, months_ahead=months_ahead, scenario=scenario)

        p50_path = result.percentiles['p50']
        reqs = compute_requirements_for_scenario(p50_path, scenario=scenario, months=result.dates)

        fund = compute_fund_sizing(reqs['materials'])
        narrative = build_narrative(fund, scenario=scenario, annual_new_builds_gw=reqs['annual_new_builds_gw'])

        return jsonify({
            'status': 'success',
            'demand_projection': {
                'scenario': scenario,
                'months': result.dates,
                'gw_path': reqs['gw_path'],
                'gw_baseline': reqs['gw_baseline'],
                'annual_new_builds_gw': reqs['annual_new_builds_gw'],
                'demand_index_p50': p50_path,
                'demand_index_p25': result.percentiles['p25'],
                'demand_index_p75': result.percentiles['p75'],
            },
            'material_requirements': reqs['materials'],
            'fund_sizing': fund,
            'narrative': narrative,
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/material-requirements/all-scenarios', methods=['POST'])
def material_requirements_all_scenarios():
    """
    Run all 6 scenarios and return material requirements + fund sizing for each.
    Body: { months_ahead: int, n_simulations: int }
    """
    try:
        body = request.json or {}
        months_ahead = int(body.get('months_ahead', 24))
        n_simulations = int(body.get('n_simulations', 3000))

        hist = ticker_collector.get_historical_for_simulation(period='1y')
        if hist.empty:
            return jsonify({'status': 'error', 'message': 'No historical data'}), 500

        simulator = MonteCarloSimulator(n_simulations=n_simulations)
        all_mc = simulator.simulate_all_scenarios(hist, months_ahead=months_ahead)

        scenarios_out = {}
        for sc_name, result in all_mc.items():
            p50 = result.percentiles['p50']
            reqs = compute_requirements_for_scenario(p50, scenario=sc_name, months=result.dates)
            fund = compute_fund_sizing(reqs['materials'])
            narrative = build_narrative(fund, scenario=sc_name, annual_new_builds_gw=reqs['annual_new_builds_gw'])
            scenarios_out[sc_name] = {
                'description': result.description,
                'gw_path': reqs['gw_path'],
                'annual_new_builds_gw': reqs['annual_new_builds_gw'],
                'material_requirements': reqs['materials'],
                'fund_sizing': fund,
                'narrative': narrative,
            }

        return jsonify({
            'status': 'success',
            'months': list(all_mc.values())[0].dates,
            'gw_baseline': 100.0,
            'scenarios': scenarios_out,
            'material_intensity': {
                mat: {
                    'total_tons_per_mw': MATERIAL_INTENSITY[mat]['total'],
                    'description': MATERIAL_INTENSITY[mat]['description'],
                    'current_price_per_ton': MATERIAL_INTENSITY[mat]['current_price_per_ton'],
                    'green_premium_per_ton': MATERIAL_INTENSITY[mat]['green_premium_per_ton'],
                }
                for mat in MATERIAL_ORDER
            },
            'timestamp': datetime.now().isoformat(),
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


def run_scheduled_tasks():
    """Run scheduled tasks in background thread"""
    def job():
        """Daily news scraping job"""
        print(f"[{datetime.now()}] Running daily news scrape for investment data...")
        try:
            # Trigger news scraping by calling get_news_based_metrics for each material
            # This will update the cache if it's a new day
            for material_id in ['steel', 'cement', 'aluminum', 'copper', 'rare_earths']:
                material_collector.get_news_based_metrics(material_id)
            print(f"[{datetime.now()}] Daily news scrape completed successfully")
        except Exception as e:
            print(f"[{datetime.now()}] Error in daily news scrape: {e}")
    
    # Schedule daily news scraping at 2 AM
    schedule.every().day.at("02:00").do(job)
    
    # Also run immediately on startup to populate initial data
    job()
    
    # Run scheduler in background thread
    def run_scheduler():
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    print("Scheduled tasks initialized: Daily news scraping at 2:00 AM")

if __name__ == '__main__':
    # Start scheduled tasks
    run_scheduled_tasks()
    app.run(debug=True, port=5001)
