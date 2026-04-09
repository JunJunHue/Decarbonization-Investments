import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingUp, Zap, Package, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SCENARIOS = [
  { key: 'base',               label: 'Base',           color: '#7A8B6F' },
  { key: 'bull',               label: 'Bull',           color: '#4A7C59' },
  { key: 'bear',               label: 'Bear',           color: '#C4534A' },
  { key: 'power_crunch',       label: 'Power Crunch',   color: '#D4873A' },
  { key: 'nuclear_renaissance',label: 'Nuclear',        color: '#6B7FC4' },
  { key: 'copper_shortage',    label: 'Copper Shock',   color: '#B08040' },
];

const MATERIAL_COLORS: Record<string, string> = {
  steel:       '#6B7A5F',
  cement:      '#A09070',
  aluminum:    '#8A9BB5',
  copper:      '#B87040',
  rare_earths: '#8A6B9A',
};

const MATERIAL_LABELS: Record<string, string> = {
  steel:       'Green Steel',
  cement:      'Low-Carbon Cement',
  aluminum:    'Renewable Aluminum',
  copper:      'Recycled Copper',
  rare_earths: 'Responsible Rare Earths',
};

const fmt$ = (v: number) => {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
};
const fmtTons = (v: number) => {
  if (v >= 1e6) return `${(v / 1e6).toFixed(1)}Mt`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(0)}kt`;
  return `${v.toLocaleString()} t`;
};

interface MaterialReq {
  label: string;
  annual_tons: number[];
  cumulative_tons: number;
  annual_years: string[];
  cumulative_value_usd: number;
  green_premium_total_usd: number;
  green_premium_per_ton: number;
  current_price_per_ton: number;
  green_description: string;
}

interface FundSizingMaterial {
  label: string;
  fund_offtake_tons: number;
  green_premium_revenue_usd: number;
  equity_needed_usd: number;
  offtake_market_value_usd: number;
  green_description: string;
}

interface FundData {
  fund_size_usd: number;
  fund_size_label: string;
  total_green_premium_usd: number;
  total_offtake_tons: number;
  total_offtake_market_value_usd: number;
  investment_leverage: number;
  fund_market_capture: number;
  offtake_term_years: number;
  target_irr: number;
  per_material: Record<string, FundSizingMaterial>;
}

interface Narrative {
  headline: string;
  sub_headline: string;
  key_points: string[];
}

interface ApiResult {
  demand_projection: {
    scenario: string;
    months: string[];
    gw_path: number[];
    gw_baseline: number;
    annual_new_builds_gw: number;
    demand_index_p50: number[];
    demand_index_p25: number[];
    demand_index_p75: number[];
  };
  material_requirements: Record<string, MaterialReq>;
  fund_sizing: FundData;
  narrative: Narrative;
}

const FundJustification: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState('base');
  const [data, setData] = useState<ApiResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monthsAhead, setMonthsAhead] = useState(24);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/material-requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months_ahead: monthsAhead, n_simulations: 5000, scenario: activeScenario }),
      });
      const json = await res.json();
      if (json.status === 'success') setData(json);
      else throw new Error(json.message);
    } catch (e: any) {
      setError(e.message || 'Failed to load projections. Ensure the API server is running.');
    } finally {
      setLoading(false);
    }
  }, [activeScenario, monthsAhead]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Chart data builders ────────────────────────────────────────────────────

  const buildGwChartData = () => {
    if (!data) return [];
    const { months, gw_path, demand_index_p25, demand_index_p75, gw_baseline } = data.demand_projection;
    return months.map((m, i) => ({
      date: new Date(m).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      gw: gw_path[i],
      p25_gw: gw_baseline * demand_index_p25[i],
      p75_gw: gw_baseline * demand_index_p75[i],
    }));
  };

  const buildMaterialChartData = () => {
    if (!data) return [];
    const mats = data.material_requirements;
    const firstMat = Object.values(mats)[0];
    if (!firstMat) return [];
    return firstMat.annual_years.map((yr, i) => {
      const point: Record<string, any> = { year: yr };
      for (const [mat, req] of Object.entries(mats)) {
        // Show in thousands of tons
        point[mat] = Math.round((req.annual_tons[i] ?? 0) / 1_000);
      }
      return point;
    });
  };

  const buildOfftakeChartData = () => {
    if (!data) return [];
    return Object.entries(data.fund_sizing.per_material).map(([mat, pm]) => ({
      name: MATERIAL_LABELS[mat] ?? mat,
      equity: Math.round(pm.equity_needed_usd / 1e6),
      premium: Math.round(pm.green_premium_revenue_usd / 1e6),
      color: MATERIAL_COLORS[mat] ?? '#888',
    }));
  };

  const activeColor = SCENARIOS.find(s => s.key === activeScenario)?.color ?? '#7A8B6F';

  return (
    <section id="fund-justification" className="py-20" style={{ backgroundColor: '#F5F3ED' }}>
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1A2A18' }}>
            From Demand to Materials to Fund Size
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            Monte Carlo demand projections translated into <strong>GW of new data center capacity</strong>,
            then into <strong>specific material requirements</strong> (steel, cement, aluminum, copper,
            rare earths), and finally into the <strong>fund size</strong> and
            <strong> offtake volumes</strong> required to secure green supply.
          </p>
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
            <div className="flex items-center space-x-3">
              <label className="text-gray-700 font-medium text-sm">Horizon:</label>
              <select
                value={monthsAhead}
                onChange={e => setMonthsAhead(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8B6F]"
              >
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={36}>36 months</option>
                <option value={60}>60 months</option>
              </select>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-gray-700 font-medium text-sm">Scenario:</label>
              <select
                value={activeScenario}
                onChange={e => setActiveScenario(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7A8B6F]"
              >
                {SCENARIOS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="ml-auto text-white font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-2"
              style={{ backgroundColor: '#7A8B6F' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Recalculate</span>
            </button>
          </div>

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

        {/* Narrative headline */}
        {data && (
          <motion.div
            className="rounded-lg p-6 mb-8 border"
            style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold mb-2" style={{ color: '#3A4A35' }}>
              {data.narrative.headline}
            </h3>
            <p className="text-gray-600 text-sm mb-4">{data.narrative.sub_headline}</p>
            <ul className="space-y-1">
              {data.narrative.key_points.map((pt, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start space-x-2">
                  <span style={{ color: activeColor }}>▸</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* KPI Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Fund Size',
                icon: <DollarSign className="w-5 h-5" style={{ color: '#7A8B6F' }} />,
                value: data.fund_sizing.fund_size_label,
                sub: `${(data.fund_sizing.fund_market_capture * 100).toFixed(0)}% market capture`,
              },
              {
                label: 'New Capacity (Base)',
                icon: <Zap className="w-5 h-5" style={{ color: '#D4873A' }} />,
                value: `${data.demand_projection.annual_new_builds_gw} GW/yr`,
                sub: `${activeScenario} scenario`,
              },
              {
                label: 'Total Offtake',
                icon: <Package className="w-5 h-5" style={{ color: '#6B7FC4' }} />,
                value: fmtTons(data.fund_sizing.total_offtake_tons),
                sub: `${data.fund_sizing.offtake_term_years}-yr contracts`,
              },
              {
                label: 'Green Premium Revenue',
                icon: <TrendingUp className="w-5 h-5" style={{ color: '#4A7C59' }} />,
                value: fmt$(data.fund_sizing.total_green_premium_usd),
                sub: `${(data.fund_sizing.investment_leverage)}x leverage deployed`,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="rounded-lg shadow p-4"
                style={{ backgroundColor: '#F0EDE5' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
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

        {/* Power Demand Projection */}
        {data && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: '#3A4A35' }}>
              Data Center Power Demand Projection (GW installed capacity)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Median (P50) path · P25–P75 band · baseline: {data.demand_projection.gw_baseline} GW in 2024
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={buildGwChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7A5F' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7A5F' }}
                  label={{ value: 'GW installed', angle: -90, position: 'insideLeft', style: { fill: '#6B7A5F', fontSize: 11 } }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => {
                    const labels: Record<string, string> = { gw: 'Median GW', p25_gw: 'P25 GW', p75_gw: 'P75 GW' };
                    return [`${Number(val).toFixed(1)} GW`, labels[name] ?? name];
                  }}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: 6, fontSize: 12 }}
                />
                <Line dataKey="p25_gw" stroke="#C4B89A" strokeWidth={1} strokeDasharray="4 2" dot={false} name="P25 GW" />
                <Line dataKey="p75_gw" stroke="#C4B89A" strokeWidth={1} strokeDasharray="4 2" dot={false} name="P75 GW" />
                <Line dataKey="gw" stroke={activeColor} strokeWidth={2.5} dot={false} name="Median GW" />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Annual Material Requirements */}
        {data && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: '#3A4A35' }}>
              Annual Material Requirements (thousands of tons)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Incremental new construction demand only · P50 demand path · {activeScenario} scenario
            </p>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={buildMaterialChartData()} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6B7A5F' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7A5F' }}
                  label={{ value: 'kt', angle: -90, position: 'insideLeft', style: { fill: '#6B7A5F', fontSize: 11 } }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`${Number(val).toLocaleString()} kt`, MATERIAL_LABELS[name] ?? name]}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: 6, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                {Object.keys(MATERIAL_COLORS).map(mat => (
                  <Bar key={mat} dataKey={mat} stackId="a" fill={MATERIAL_COLORS[mat]} name={MATERIAL_LABELS[mat] ?? mat} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Offtake & Equity Breakdown */}
        {data && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-1" style={{ color: '#3A4A35' }}>
              Equity Needed vs Green-Premium Revenue by Material ($M)
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Fund deploys equity into supply chain producers; earns green-premium spread over {data.fund_sizing.offtake_term_years}-year offtake
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={buildOfftakeChartData()} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7A5F' }}
                  label={{ value: '$M', position: 'insideBottom', offset: -2, style: { fill: '#6B7A5F', fontSize: 11 } }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6B7A5F' }} width={160} />
                <Tooltip
                  formatter={(val: any, name: any) => [`$${Number(val).toLocaleString()}M`, name === 'equity' ? 'Equity needed' : 'Green premium revenue']}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: 6, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="equity" name="Equity needed ($M)" fill="#C4B89A" />
                <Bar dataKey="premium" name="Green premium revenue ($M)" fill="#7A8B6F" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Per-material offtake table */}
        {data && (
          <motion.div
            className="rounded-lg shadow-lg p-6 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-bold mb-4" style={{ color: '#3A4A35' }}>
              Offtake Agreement Summary
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#C4B89A' }}>
                    {['Material', 'Offtake Volume', 'Market Value', 'Green Premium / ton', 'Premium Revenue', 'Equity Needed', 'Strategy'].map(h => (
                      <th key={h} className="text-left py-2 px-3 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(data.fund_sizing.per_material).map(([mat, pm], i) => (
                    <tr key={mat} className={i % 2 === 0 ? '' : 'bg-black/5'}>
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: MATERIAL_COLORS[mat] }} />
                          <span className="font-medium">{pm.label}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">{fmtTons(pm.fund_offtake_tons)}</td>
                      <td className="py-2 px-3">{fmt$(pm.offtake_market_value_usd)}</td>
                      <td className="py-2 px-3">${(data.material_requirements[mat]?.green_premium_per_ton ?? 0).toLocaleString()}/t</td>
                      <td className="py-2 px-3 font-medium" style={{ color: '#4A7C59' }}>{fmt$(pm.green_premium_revenue_usd)}</td>
                      <td className="py-2 px-3 font-medium" style={{ color: '#3A4A35' }}>{fmt$(pm.equity_needed_usd)}</td>
                      <td className="py-2 px-3 text-xs text-gray-500 max-w-xs">{pm.green_description}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t font-bold" style={{ borderColor: '#C4B89A' }}>
                    <td className="py-2 px-3">Total</td>
                    <td className="py-2 px-3">{fmtTons(data.fund_sizing.total_offtake_tons)}</td>
                    <td className="py-2 px-3">{fmt$(data.fund_sizing.total_offtake_market_value_usd)}</td>
                    <td className="py-2 px-3">—</td>
                    <td className="py-2 px-3" style={{ color: '#4A7C59' }}>{fmt$(data.fund_sizing.total_green_premium_usd)}</td>
                    <td className="py-2 px-3" style={{ color: '#3A4A35' }}>{data.fund_sizing.fund_size_label}</td>
                    <td className="py-2 px-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}

        {/* Methodology note */}
        <motion.div
          className="p-8 rounded-lg border"
          style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-xl font-bold text-gray-800 mb-4">Methodology</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Step 1 — Demand Index → GW</h4>
              <ul className="space-y-1">
                <li>• Monte Carlo P50 demand index scaled to 100 GW 2024 baseline</li>
                <li>• Demand index ≥ 1.0 = installed capacity multiple of today</li>
                <li>• GW path drives all downstream calculations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Step 2 — GW → Material Tons</h4>
              <ul className="space-y-1">
                <li>• Incremental new GW/year × intensity coefficients (tons/MW)</li>
                <li>• Steel 730 t/MW · Cement 1,550 t/MW · Al 43 t/MW</li>
                <li>• Copper 34 t/MW · Rare Earths 0.8 t/MW</li>
                <li>• Sources: IEA, LBNL, Goldman Sachs, RMI</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Step 3 — Tons → Fund Size</h4>
              <ul className="space-y-1">
                <li>• 60% hyperscaler share of new builds (MSFT/GOOGL/AMZN/META/ORCL)</li>
                <li>• Fund captures 15% of hyperscaler demand via offtake agreements</li>
                <li>• Green premium stream financed at 4.5× equity leverage</li>
                <li>• {data ? `${data.fund_sizing.offtake_term_years}` : 7}-year offtake term · 22% target gross IRR</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#7A8B6F' }} />
            <span className="ml-3 text-gray-500">Computing demand projections and material requirements…</span>
          </div>
        )}

      </div>
    </section>
  );
};

export default FundJustification;
