import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, Database, RefreshCw } from 'lucide-react';

const DataCenterPredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [daysAhead, setDaysAhead] = useState(30);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/predict-future`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: daysAhead }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setPredictions(data.predictions);
        calculateStats(data.predictions);
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load predictions');
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/latest-data`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setLatestData(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching latest data:', err);
    }
  };

  const triggerDataCollection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/collect-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: 365 }),
      });

      if (!response.ok) {
        throw new Error('Failed to collect data');
      }

      const data = await response.json();
      if (data.status === 'success') {
        // After collecting data, train model and fetch predictions
        await trainModel();
        await fetchPredictions();
        await fetchLatestData();
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to collect data');
    } finally {
      setLoading(false);
    }
  };

  const trainModel = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/train-model`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to train model');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error('Error training model:', err);
      throw err;
    }
  };

  const calculateStats = (predData: any[]) => {
    if (!predData || predData.length === 0) return;

    const values = predData.map((p: any) => p.predicted_demand);
    const current = values[0];
    const future = values[values.length - 1];
    const change = ((future - current) / current) * 100;
    const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);

    setStats({
      current,
      future,
      change,
      average: avg,
      max,
      min,
    });
  };

  useEffect(() => {
    fetchPredictions();
    fetchLatestData();
  }, [daysAhead]);

  const chartData = predictions.map((p, index) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    demand: Math.round(p.predicted_demand),
    day: index + 1,
  }));

  return (
    <section id="predictor" className="py-20" style={{ backgroundColor: '#F5F3ED' }}>
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Data Center Demand Predictor
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            Advanced machine learning model that predicts data center demand based on copper prices, 
            energy markets, tech stock performance, and power availability indicators.
          </p>
          <div className="mt-4 p-4 rounded-lg border max-w-4xl mx-auto" style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}>
            <p className="text-sm" style={{ color: '#5A6B4F' }}>
              <strong>About the Demand Index:</strong> The numbers represent a composite demand index (not absolute units). 
              Higher values indicate greater predicted demand. The index combines normalized indicators: tech stock performance (30%), 
              copper prices (20%), energy costs (10%), and exponential growth trends (40%). Values are relative and should be 
              interpreted as trends rather than absolute quantities.
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-gray-700 font-medium">Forecast Period:</label>
              <select
                value={daysAhead}
                onChange={(e) => setDaysAhead(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4A5568]"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={fetchPredictions}
                disabled={loading}
                className="text-white font-bold rounded-lg px-6 py-2 hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2" style={{ backgroundColor: '#7A8B6F' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Predictions</span>
              </button>

              <button
                onClick={triggerDataCollection}
                disabled={loading}
                className="text-white font-bold rounded-lg px-6 py-2 transition-all duration-300 disabled:opacity-50 flex items-center space-x-2" style={{ backgroundColor: '#7A8B6F' }}
              >
                <Database className="w-4 h-4" />
                <span>Collect & Train</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}>
              <p className="text-red-700">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                Make sure the API server is running on port 5001. Run: python run_pipeline.py
              </p>
            </div>
          )}
        </motion.div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F0EDE5' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-end mb-2">
                {stats.change > 0 ? (
                  <TrendingUp className="w-5 h-5" style={{ color: '#7A8B6F' }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color: '#C4B89A' }} />
                )}
              </div>
              <h3 className="text-sm font-medium" style={{ color: '#6B7A5F' }}>Current Demand Index</h3>
              <p className="text-2xl font-bold" style={{ color: '#5A6B4F' }}>{Math.round(stats.current)}</p>
              <p className="text-xs mt-1" style={{ color: '#7A8B6F' }}>Composite Index</p>
            </motion.div>

            <motion.div
              className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F0EDE5' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-end mb-2">
                {stats.change > 0 ? (
                  <TrendingUp className="w-5 h-5" style={{ color: '#7A8B6F' }} />
                ) : (
                  <TrendingDown className="w-5 h-5" style={{ color: '#C4B89A' }} />
                )}
              </div>
              <h3 className="text-sm font-medium" style={{ color: '#6B7A5F' }}>Projected Demand Index</h3>
              <p className="text-2xl font-bold" style={{ color: '#5A6B4F' }}>{Math.round(stats.future)}</p>
              <p className="text-xs mt-1" style={{ color: '#7A8B6F' }}>Composite Index</p>
              <p className="text-sm mt-1" style={{ color: stats.change > 0 ? '#7A8B6F' : '#C4B89A' }}>
                {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
              </p>
            </motion.div>

            <motion.div
              className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F0EDE5' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-medium mb-2" style={{ color: '#6B7A5F' }}>Average Demand Index</h3>
              <p className="text-2xl font-bold" style={{ color: '#5A6B4F' }}>{Math.round(stats.average)}</p>
              <p className="text-xs mt-1" style={{ color: '#7A8B6F' }}>Composite Index</p>
            </motion.div>

            <motion.div
              className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#F0EDE5' }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-medium mb-2" style={{ color: '#6B7A5F' }}>Range</h3>
              <p className="text-lg font-bold" style={{ color: '#5A6B4F' }}>
                {Math.round(stats.min)} - {Math.round(stats.max)}
              </p>
            </motion.div>
          </div>
        )}

        {/* Prediction Chart */}
        {chartData.length > 0 && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8" style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-4">Demand Index Forecast</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Demand Index (Composite)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="demand"
                  stroke="#4A5568"
                  strokeWidth={3}
                  dot={{ fill: '#4A5568', r: 4 }}
                  name="Predicted Demand Index"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Data Sources Info */}
        <motion.div
          className="p-8 rounded-lg border" style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Data Sources</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Market Indicators</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Copper prices (Trading Economics / Yahoo Finance)</li>
                <li>• Energy ETF (iShares U.S. Energy ETF)</li>
                <li>• Power availability indicators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2" style={{ color: '#5A6B4F' }}>Tech Company Metrics</h4>
              <ul className="text-sm space-y-1" style={{ color: '#6B7A5F' }}>
                <li>• Meta (META) stock performance</li>
                <li>• Google (GOOGL) stock performance</li>
                <li>• Microsoft (MSFT) stock performance</li>
                <li>• Apple (AAPL) stock performance</li>
                <li>• Amazon (AMZN) stock performance</li>
              </ul>
            </div>
          </div>
          <p className="text-sm mt-4" style={{ color: '#6B7A5F' }}>
            The ML model uses advanced ensemble methods (XGBoost, LightGBM, Random Forest) 
            to analyze these indicators and predict data center demand with high accuracy.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default DataCenterPredictor;
