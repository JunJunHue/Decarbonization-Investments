import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { RefreshCw, Radio } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const SECTOR_LABELS: Record<string, string> = {
  ai_demand: 'AI Demand & Hyperscalers',
  digital_infrastructure: 'Digital Infrastructure',
  power_infrastructure: 'Power Infrastructure',
  nuclear: 'Nuclear Energy',
  natural_gas: 'Natural Gas',
  renewables: 'Renewables',
  fiber_networking: 'Fiber & Networking',
  copper_minerals: 'Copper & Minerals',
  broad_etfs: 'Broad ETFs',
};

const SECTOR_COLORS: Record<string, string> = {
  ai_demand: '#7C3AED',
  digital_infrastructure: '#2563EB',
  power_infrastructure: '#D97706',
  nuclear: '#059669',
  natural_gas: '#DC2626',
  renewables: '#16A34A',
  fiber_networking: '#0891B2',
  copper_minerals: '#B45309',
  broad_etfs: '#6B7280',
};

const THEMATIC_SIGNAL_LABELS: Record<string, string> = {
  power_scarcity: 'Power Scarcity',
  nuclear_momentum: 'Nuclear Momentum',
  copper_demand: 'Copper Demand',
  ai_compute: 'AI Compute',
  dc_buildout: 'DC Buildout',
  grid_buildout: 'Grid Buildout',
};

interface TickerData {
  symbol: string;
  sector: string;
  description: string;
  current_price: number;
  change_1d: number;
  change_7d: number;
  change_30d: number;
  change_90d: number;
  volatility_30d: number;
  momentum_score: number;
  demand_weight: number;
  updated_at: string;
}

const pct = (v: number) => (v >= 0 ? '+' : '') + (v * 100).toFixed(2) + '%';
const changeColor = (v: number) => (v >= 0 ? '#16A34A' : '#DC2626');
const changeBg = (v: number) => (v >= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)');

const TickerRow: React.FC<{ t: TickerData; rank?: number }> = ({ t, rank }) => (
  <div
    className="flex items-center py-2.5 px-3 rounded-lg border-b hover:bg-gray-50 transition-colors"
    style={{ borderColor: '#E8E4D8' }}
  >
    <div className="w-8 text-xs text-gray-400 font-mono">{rank ?? ''}</div>
    <div className="w-16 font-bold text-sm" style={{ color: '#3A4A35' }}>{t.symbol}</div>
    <div className="flex-1 text-xs text-gray-500 truncate pr-3">{t.description.split(' — ')[1] ?? t.description}</div>
    <div className="w-24 text-right font-mono text-sm font-medium" style={{ color: '#3A4A35' }}>
      ${t.current_price < 1000 ? t.current_price.toFixed(2) : t.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
    </div>
    {([['1d', t.change_1d], ['7d', t.change_7d], ['30d', t.change_30d]] as [string, number][]).map(([label, val]) => (
      <div
        key={label}
        className="w-20 text-right text-xs font-mono rounded px-1.5 py-0.5 ml-1"
        style={{ color: changeColor(val), backgroundColor: changeBg(val) }}
      >
        {pct(val)}
      </div>
    ))}
    {t.demand_weight > 0 && (
      <div className="w-16 text-right text-xs text-gray-400 ml-2">
        {(t.demand_weight * 100).toFixed(0)}% wt
      </div>
    )}
  </div>
);

const TickerDashboard: React.FC = () => {
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const [sectorMomentum, setSectorMomentum] = useState<Record<string, any>>({});
  const [thematicSignals, setThematicSignals] = useState<Record<string, any>>({});
  const [demandIndex, setDemandIndex] = useState<any>(null);
  const [activeSector, setActiveSector] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [sortBy, setSortBy] = useState<'momentum_score' | 'change_30d' | 'change_7d'>('momentum_score');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tickers?period=3mo`);
      const data = await res.json();
      if (data.status === 'success') {
        setTickers(data.tickers);
        setSectorMomentum(data.sector_momentum);
        setThematicSignals(data.thematic_signals);
        setDemandIndex(data.demand_index);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to fetch ticker data:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group tickers by sector
  const tickersBySector = Object.values(tickers).reduce<Record<string, TickerData[]>>((acc, t) => {
    if (!acc[t.sector]) acc[t.sector] = [];
    acc[t.sector].push(t);
    return acc;
  }, {});

  const displayedTickers =
    activeSector === 'all'
      ? Object.values(tickers)
      : tickersBySector[activeSector] ?? [];

  const sorted = [...displayedTickers].sort((a: any, b: any) => b[sortBy] - a[sortBy]);

  // Sector heatmap data
  const heatmapData = Object.entries(sectorMomentum)
    .map(([sector, info]: [string, any]) => ({
      name: SECTOR_LABELS[sector]?.replace(' & ', '\n& ') ?? sector,
      momentum: +(info.momentum * 100).toFixed(2),
      sector,
    }))
    .sort((a, b) => b.momentum - a.momentum);

  const allSectors = Object.keys(SECTOR_LABELS);

  return (
    <section id="ticker-dashboard" className="py-20" style={{ backgroundColor: '#FAFAF7' }}>
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
            AI Infrastructure Tracker
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Real-time price tracking across 80+ tickers spanning AI compute, power infrastructure,
            nuclear energy, copper, fiber networking, and critical minerals.
          </p>
        </motion.div>

        {/* Demand Index + Refresh */}
        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
          {demandIndex && (
            <div className="flex items-center space-x-6">
              <div className="rounded-lg px-5 py-3 border" style={{ backgroundColor: '#F0EDE5', borderColor: '#C4B89A' }}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Composite Demand Index</p>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold" style={{ color: '#3A4A35' }}>
                    {demandIndex.index?.toFixed(2) ?? '—'}
                  </span>
                  <div className="text-sm">
                    <div style={{ color: changeColor(demandIndex.change_7d ?? 0) }}>
                      7d {pct(demandIndex.change_7d ?? 0)}
                    </div>
                    <div style={{ color: changeColor(demandIndex.change_30d ?? 0) }}>
                      30d {pct(demandIndex.change_30d ?? 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 flex items-center space-x-1">
                <Radio className="w-3 h-3" />
                <span>Updated {lastUpdated}</span>
              </span>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="text-white font-medium rounded-lg px-4 py-2 text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center space-x-2"
              style={{ backgroundColor: '#7A8B6F' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Thematic Signals */}
        {Object.keys(thematicSignals).length > 0 && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            {Object.entries(thematicSignals).map(([key, sig]: [string, any]) => {
              const score = sig.score ?? 0;
              return (
                <div
                  key={key}
                  className="rounded-lg p-3 border text-center"
                  style={{ backgroundColor: '#F5F3ED', borderColor: '#D8D4CA' }}
                >
                  <p className="text-xs text-gray-500 mb-1 leading-tight">
                    {THEMATIC_SIGNAL_LABELS[key] ?? key}
                  </p>
                  <p className="text-lg font-bold" style={{ color: changeColor(score) }}>
                    {pct(score)}
                  </p>
                  <p className="text-xs text-gray-400">30d avg</p>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Sector Heatmap */}
        {heatmapData.length > 0 && (
          <motion.div
            className="rounded-lg shadow p-5 mb-8"
            style={{ backgroundColor: '#F0EDE5' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h3 className="text-base font-bold mb-4" style={{ color: '#3A4A35' }}>
              Sector 30-Day Momentum
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={heatmapData} layout="vertical" margin={{ left: 160, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D8D4CA" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={v => v + '%'}
                  tick={{ fontSize: 11, fill: '#6B7A5F' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#4A5D40' }}
                  width={155}
                />
                <Tooltip
                  formatter={(v: any) => [Number(v ?? 0).toFixed(2) + '%', '30d momentum']}
                  contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', fontSize: 12 }}
                />
                <Bar dataKey="momentum" radius={[0, 4, 4, 0]}>
                  {heatmapData.map((entry) => (
                    <Cell
                      key={entry.sector}
                      fill={SECTOR_COLORS[entry.sector] ?? '#7A8B6F'}
                      fillOpacity={0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Sector Tabs + Ticker Table */}
        <motion.div
          className="rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: 'white' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b" style={{ borderColor: '#E8E4D8', backgroundColor: '#F8F7F3' }}>
            {(['all', ...allSectors] as string[]).map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className="px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors border-b-2"
                style={{
                  borderColor: activeSector === sector ? '#7A8B6F' : 'transparent',
                  color: activeSector === sector ? '#4A5D40' : '#9CA3AF',
                  backgroundColor: activeSector === sector ? 'white' : 'transparent',
                }}
              >
                {sector === 'all' ? 'All Tickers' : SECTOR_LABELS[sector] ?? sector}
                {sector !== 'all' && tickersBySector[sector] && (
                  <span className="ml-1 text-gray-400">({tickersBySector[sector].length})</span>
                )}
              </button>
            ))}
          </div>

          {/* Sort controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b text-xs text-gray-500" style={{ borderColor: '#E8E4D8', backgroundColor: '#FAFAF7' }}>
            <div className="flex items-center space-x-1">
              <span className="w-8" />
              <span className="w-16 font-medium">Ticker</span>
              <span className="flex-1">Description</span>
              <span className="w-24 text-right">Price</span>
              <span className="w-20 text-right">1d</span>
              <span className="w-20 text-right">7d</span>
              <span className="w-20 text-right">30d</span>
              <span className="w-16 text-right">Weight</span>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <span>Sort:</span>
              {(['momentum_score', 'change_30d', 'change_7d'] as ('momentum_score' | 'change_30d' | 'change_7d')[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className="px-2 py-0.5 rounded text-xs"
                  style={{
                    backgroundColor: sortBy === s ? '#7A8B6F' : '#E8E4D8',
                    color: sortBy === s ? 'white' : '#6B7A5F',
                  }}
                >
                  {s === 'momentum_score' ? 'Momentum' : s === 'change_30d' ? '30d %' : '7d %'}
                </button>
              ))}
            </div>
          </div>

          {/* Ticker rows */}
          <div className="px-4 py-2 max-h-[600px] overflow-y-auto">
            {loading && sorted.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-3 text-gray-400 text-sm">Fetching live prices…</span>
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No ticker data available. Ensure the API server is running.
              </div>
            ) : (
              sorted.map((t, i) => <TickerRow key={t.symbol} t={t} rank={i + 1} />)
            )}
          </div>

          {/* Footer */}
          {sorted.length > 0 && (
            <div className="px-4 py-3 border-t text-xs text-gray-400 flex items-center justify-between" style={{ borderColor: '#E8E4D8', backgroundColor: '#FAFAF7' }}>
              <span>
                Showing {sorted.length} tickers
                {activeSector !== 'all' && ` in ${SECTOR_LABELS[activeSector]}`}
              </span>
              <span>Data: Yahoo Finance (15-min delay) · Updates cached 5 min</span>
            </div>
          )}
        </motion.div>

        {/* Key thematic notes */}
        <motion.div
          className="mt-8 grid md:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            {
              title: 'Power Scarcity Picks & Shovels',
              body: 'ETN, GEV, PWR, CEG, VST are the most direct beneficiaries of power demand from AI data center buildout — grid hardware, turbines, and nuclear operators.',
              color: '#D97706',
            },
            {
              title: 'Uranium Supercycle',
              body: 'CCJ and URA for nuclear renaissance exposure. Long-term power-purchase agreements between nuclear operators and hyperscalers are structural demand drivers.',
              color: '#059669',
            },
            {
              title: 'Copper Structural Deficit',
              body: 'FCX and COPX for copper demand from AI data centers, EV adoption, and grid upgrades. Physical copper is required for cooling, wiring, and all power infrastructure.',
              color: '#B45309',
            },
          ].map((note, i) => (
            <div
              key={i}
              className="rounded-lg p-4 border-l-4"
              style={{ borderColor: note.color, backgroundColor: note.color + '0D' }}
            >
              <h4 className="font-semibold text-sm mb-1" style={{ color: note.color }}>{note.title}</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{note.body}</p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default TickerDashboard;
