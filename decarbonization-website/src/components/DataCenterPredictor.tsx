import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Zap, RefreshCw, AlertTriangle, BarChart2 } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SCENARIOS = [
  { key: 'base', label: 'Base', color: '#7A8B6F' },
  { key: 'bull', label: 'Bull', color: '#4A7C59' },
  { key: 'bear', label: 'Bear', color: '#C4534A' },
  { key: 'power_crunch', label: 'Power Crunch', color: '#D4873A' },
  { key: 'nuclear_renaissance', label: 'Nuclear', color: '#6B7FC4' },
  { key: 'copper_shortage', label: 'Copper Shock', color: '#B08040' },
];

interface SimResult {
  scenario: string;
  description: string;
  dates: string[];
  percentiles: Record<string, number[]>;
  mean_path: number[];
  risk_stats: {
    var_95: number;
    cvar_95: number;
    prob_exceed_150_pct: number;
    prob_exceed_200_pct: number;
  };
  baseline: number;
  n_simulations: number;
}

const fmt = (v: number) => (v * 100).toFixed(1) + '%';
const fmtIdx = (v: number) => v.toFixed(3);

const DataCenterPredictor: React.FC = () => {
  const [simResults, setSimResults] = useState<Record<string, SimResult>>({});
  const [activeScenario, setActiveScenario] = useState<string>('base');
  const [compareMode, setCompareMode] = useState(false);
  const [monthsAhead, setMonthsAhead] = useState(12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simMode, setSimMode] = useState<'single' | 'all'>('single');

  const runSimulation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (simMode === 'all') {
        const res = await fetch(`${API_BASE}/simulate-scenarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ months_ahead: monthsAhead, n_simulations: 5000 }),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setSimResults(data.scenarios);
          setCompareMode(true);
        } else throw new Error(data.message);
      } else {
        const res = await fetch(`${API_BASE}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ months_ahead: monthsAhead, n_simulations: 10000, scenario: activeScenario }),
        });
        const data = await res.json();
        if (data.status === 'success') {
          setSimResults(prev => ({ ...prev, [activeScenario]: data.simulation }));
          setCompareMode(false);
        } else throw new Error(data.message);
      }
    } catch (e: any) {
      setError(e.message || 'Simulation failed. Make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  }, [monthsAhead, activeScenario, simMode]);

  useEffect(() => { runSimulation(); }, [monthsAhead]);

  // ---- Chart data -------------------------------------------------------
  const buildFanData = (result: SimResult) => {
    const { p5, p25, p50, p75, p95 } = result.percentiles as any;
    return result.dates.map((date, i) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      outer_base: p5[i],
      outer_spread: p95[i] - p5[i],
      inner_base: p25[i],
      inner_spread: p75[i] - p25[i],
      median: p50[i],
      mean: result.mean_path[i],
    }));
  };

  const buildCompareData = () => {
    const scenarios = Object.values(simResults);
    if (scenarios.length === 0) return [];
    const dates = scenarios[0].dates;
    return dates.map((date, i) => {
      const point: any = {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      };
      scenarios.forEach(s => {
        point[s.scenario] = s.percentiles['p50'][i];
      });
      return point;
    });
  };

  const currentResult = simResults[activeScenario];
  const hasData = !!currentResult;
  const hasAllScenarios = Object.keys(simResults).length === 6;

  return (
    <section id="predictor" className="py-20" style={{ backgroundColor: '#F5F3ED' }}>
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Data Center Demand Forecast
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            Monte Carlo simulation using{' '}
            <strong>Geometric Brownian Motion</strong> with correlated demand
            drivers — 10,000 paths, Cholesky decomposition, and Ornstein-Uhlenbeck
            mean-reversion for commodity tickers.
          </p>
          <div className="mt-4 p-4 rounded-lg border max-w-4xl mx-auto" style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}>
            <p className="text-sm" style={{ color: '#5A6B4F' }}>
              <strong>Composite Demand Index</strong> — weighted average of 20 normalised
              demand drivers (NVDA 12%, TSM 8%, EQIX 7%, VRT 6%, CEG 6%, ETN 5%, …).
              Bands show P5–P95 (outer) and P25–P75 (inner) confidence intervals.
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
          <div className="flex flex-wrap items-center gap-4">
            {/* Horizon */}
            <div className="flex items-center space-x-3">
              <label className="text-gray-700 font-medium text-sm">Horizon:</label>
              <select
                value={monthsAhead}
                onChange={(e) => setMonthsAhead(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8B6F]"
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
              </select>
            </div>

            {/* Scenario selector */}
            <div className="flex items-center space-x-3">
              <label className="text-gray-700 font-medium text-sm">Scenario:</label>
              <select
                value={activeScenario}
                onChange={(e) => { setActiveScenario(e.target.value); setCompareMode(false); }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8B6F]"
              >
                {SCENARIOS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex space-x-2 ml-auto">
              <button
                onClick={() => { setSimMode('single'); runSimulation(); }}
                disabled={loading}
                className="text-white font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-2"
                style={{ backgroundColor: '#7A8B6F' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading && simMode === 'single' ? 'animate-spin' : ''}`} />
                <span>Run Simulation</span>
              </button>
              <button
                onClick={() => { setSimMode('all'); runSimulation(); }}
                disabled={loading}
                className="font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-2 border"
                style={{ borderColor: '#7A8B6F', color: '#7A8B6F' }}
              >
                <BarChart2 className={`w-4 h-4 ${loading && simMode === 'all' ? 'animate-spin' : ''}`} />
                <span>All Scenarios</span>
              </button>
            </div>
          </div>

          {/* Scenario description */}
          {currentResult && !compareMode && (
            <p className="mt-3 text-sm text-gray-500 italic">
              {currentResult.description} &nbsp;·&nbsp; {currentResult.n_simulations.toLocaleString()} paths
            </p>
          )}

          {error && (
            <div className="mt-4 p-3 border rounded-lg flex items-start space-x-2" style={{ backgroundColor: '#FFF3F0', borderColor: '#F4A79A' }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  Ensure the API server is running: <code>python run_pipeline.py</code>
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Risk Stats */}
        {currentResult && !compareMode && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Median (P50)', icon: <Activity className="w-5 h-5" style={{ color: '#7A8B6F' }} />,
                value: fmtIdx(currentResult.percentiles['p50'][currentResult.percentiles['p50'].length - 1]),
                sub: 'terminal demand index',
              },
              {
                label: 'P95 Upside', icon: <TrendingUp className="w-5 h-5" style={{ color: '#4A7C59' }} />,
                value: fmtIdx(currentResult.percentiles['p95'][currentResult.percentiles['p95'].length - 1]),
                sub: 'bull case ceiling',
              },
              {
                label: 'VaR (P5)', icon: <TrendingDown className="w-5 h-5" style={{ color: '#C4534A' }} />,
                value: fmtIdx(currentResult.risk_stats.var_95),
                sub: '95% conf. downside',
              },
              {
                label: 'Prob > 1.5×', icon: <Zap className="w-5 h-5" style={{ color: '#D4873A' }} />,
                value: fmt(currentResult.risk_stats.prob_exceed_150_pct),
                sub: 'chance of 50%+ growth',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="rounded-lg shadow p-4"
                style={{ backgroundColor: '#F0EDE5' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</span>
                  {card.icon}
                </div>
                <p className="text-2xl font-bold" style={{ color: '#3A4A35' }}>{card.value}</p>
                <p className="text-xs mt-1 text-gray-500">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Fan Chart — single scenario */}
        {hasData && !compareMode && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#3A4A35' }}>
                Monte Carlo Fan Chart — {SCENARIOS.find(s => s.key === activeScenario)?.label} Scenario
              </h3>
              <span className="text-xs text-gray-400">
                P5–P95 outer · P25–P75 inner · median solid · mean dashed
              </span>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={buildFanData(currentResult)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7A5F' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7A5F' }}
                  tickFormatter={v => v.toFixed(2)}
                  label={{ value: 'Demand Index', angle: -90, position: 'insideLeft', style: { fill: '#6B7A5F', fontSize: 11 } }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    if (!val || name === 'outer_base' || name === 'inner_base') return null;
                    const labels: Record<string, string> = {
                      outer_spread: 'P5–P95 band',
                      inner_spread: 'P25–P75 band',
                      median: 'Median (P50)',
                      mean: 'Mean path',
                    };
                    return [Number(val).toFixed(3), labels[name] || name];
                  }}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: 6, fontSize: 12 }}
                />
                {/* Outer P5–P95 band */}
                <Area dataKey="outer_base" stackId="outer" fill="transparent" stroke="none" legendType="none" />
                <Area dataKey="outer_spread" stackId="outer" fill="rgba(122,139,111,0.12)" stroke="none" name="P5–P95 band" />
                {/* Inner P25–P75 band */}
                <Area dataKey="inner_base" stackId="inner" fill="transparent" stroke="none" legendType="none" />
                <Area dataKey="inner_spread" stackId="inner" fill="rgba(122,139,111,0.28)" stroke="none" name="P25–P75 band" />
                {/* Median line */}
                <Line dataKey="median" stroke="#4A5D40" strokeWidth={2.5} dot={false} name="Median (P50)" />
                {/* Mean line */}
                <Line dataKey="mean" stroke="#8A9B80" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Mean path" />
                <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Scenario Comparison Chart */}
        {compareMode && hasAllScenarios && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: '#3A4A35' }}>
                Scenario Comparison — Median (P50) Paths
              </h3>
              <button
                onClick={() => setCompareMode(false)}
                className="text-xs text-gray-500 underline hover:text-gray-700"
              >
                back to single scenario
              </button>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={buildCompareData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7A5F' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7A5F' }}
                  tickFormatter={v => v.toFixed(2)}
                  label={{ value: 'Demand Index (P50)', angle: -90, position: 'insideLeft', style: { fill: '#6B7A5F', fontSize: 11 } }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [Number(val ?? 0).toFixed(3), name]}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: 6, fontSize: 12 }}
                />
                <Legend iconType="line" wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                {SCENARIOS.map(s => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    name={s.label}
                    strokeDasharray={s.key === 'bear' ? '6 3' : undefined}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>

            {/* Scenario descriptions */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {SCENARIOS.map(s => {
                const r = simResults[s.key];
                if (!r) return null;
                return (
                  <div key={s.key} className="rounded-md p-3 border" style={{ borderColor: s.color + '66', backgroundColor: s.color + '11' }}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs font-bold" style={{ color: s.color }}>{s.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-snug">{r.description}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: s.color }}>
                      P50 terminal: {fmtIdx(r.percentiles['p50'][r.percentiles['p50'].length - 1])}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#7A8B6F' }} />
            <span className="ml-3 text-gray-500">Running Monte Carlo simulation…</span>
          </div>
        )}

        {/* Data sources */}
        <motion.div
          className="p-8 rounded-lg border"
          style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Simulation Methodology</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Price Process</h4>
              <ul className="space-y-1">
                <li>• <strong>GBM</strong> for equities (log-normal, no negative prices)</li>
                <li>• <strong>Ornstein-Uhlenbeck</strong> for commodities (mean-reversion to cost of production)</li>
                <li>• <strong>Cholesky decomposition</strong> preserves empirical correlations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Demand Drivers (20)</h4>
              <ul className="space-y-1">
                <li>• NVDA 12% · TSM 8% · EQIX 7%</li>
                <li>• VRT 6% · CEG 6% · ETN/GEV 5% each</li>
                <li>• MSFT/GOOGL/AMZN 5% each</li>
                <li>• FCX 4% · ANET 4% · others</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Scenarios</h4>
              <ul className="space-y-1">
                {SCENARIOS.map(s => (
                  <li key={s.key}>
                    <span className="font-medium" style={{ color: s.color }}>● {s.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default DataCenterPredictor;
