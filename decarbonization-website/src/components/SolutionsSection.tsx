import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import {
  HardHat,
  Zap,
  Cpu,
  Magnet,
  Factory,
  RefreshCw
} from 'lucide-react';

const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('steel');
  const [materialData, setMaterialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
  
  const fetchMaterialData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/material-data`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          setMaterialData(data.materials);
        }
      }
    } catch (error) {
      console.error('Error fetching material data:', error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchMaterialData();
  }, [fetchMaterialData]);

  const getInvestmentData = (materialId: string) => {
    // Investment data with actual dollar amounts and clearer representation
    // Shows: Required Investment, Recent Funding, Remaining Gap
    const investmentAmounts: { [key: string]: { required: number, recent: number, gap: number, unit: string } } = {
      'steel': {
        required: 6000, // $6B/year
        recent: 200, // ~$200M recent funding
        gap: 5800, // $5.8B gap
        unit: 'M' // Millions
      },
      'cement': {
        required: 1500000, // $1.5T needed by 2050, show as $1500B
        recent: 143, // $124.5M + $18M = ~$143M
        gap: 1499857, // Massive gap
        unit: 'M' // Millions (for recent), but scale will show this differently
      },
      'aluminum': {
        required: 500000, // $500B needed, show as $500B
        recent: 500, // Estimated from recent deals
        gap: 499500, // $499.5B gap
        unit: 'M' // Millions
      },
      'copper': {
        required: 100000, // $100B needed
        recent: 17, // Edge Copper $17M
        gap: 99983, // $99.983B gap
        unit: 'M' // Millions
      },
      'rare-earths': {
        required: 8500, // $8.5B US-Australia deal shows scale
        recent: 9000, // Apple $500M + $8.5B = $9B
        gap: 0, // Actually meeting demand, but China still dominates
        unit: 'M' // Millions
      }
    };
    
    // Map frontend IDs to API IDs
    const apiIdMap: { [key: string]: string } = {
      'steel': 'steel',
      'cement': 'cement',
      'aluminum': 'aluminum',
      'copper': 'copper',
      'rare-earths': 'rare_earths'
    };
    
    const apiId = apiIdMap[materialId] || materialId;
    const amounts = investmentAmounts[materialId] || investmentAmounts['steel'];
    
    // Convert to percentage for visual comparison (normalized to required investment)
    const required = amounts.required;
    const recent = amounts.recent;
    const gap = amounts.gap;
    
    // Calculate percentages based on required investment (scale to 100%)
    const recentPct = Math.min(100, (recent / required) * 100);
    const gapPct = Math.min(100, (gap / required) * 100);
    
    // Format amounts for display
    const formatAmount = (val: number) => {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}T`;
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}B`;
      return `$${val.toFixed(0)}M`;
    };
    
    // Use API data if available, otherwise use hardcoded data
    let finalData = [
      { 
        name: 'Required Investment', 
        value: 100, 
        actualValue: required,
        formattedValue: formatAmount(required),
        color: '#D4C9B0' // Light background color
      },
      { 
        name: 'Recent Funding', 
        value: recentPct, 
        actualValue: recent,
        formattedValue: formatAmount(recent),
        color: '#9CAF88' // Green - positive
      },
      { 
        name: 'Investment Gap', 
        value: gapPct, 
        actualValue: gap,
        formattedValue: formatAmount(gap),
        color: '#C4B89A' // Warning color
      }
    ];
    
    // If API provides investment metrics, try to incorporate them
    if (materialData && materialData[apiId] && materialData[apiId].investment_metrics) {
      const metrics = materialData[apiId].investment_metrics;
      // Scale API percentages to our dollar amounts
      if (metrics.recent_funding && metrics.investment_gap) {
        const apiRecentPct = metrics.recent_funding;
        const apiGapPct = metrics.investment_gap;
        
        // Adjust based on API data (use API as multiplier)
        finalData[1].value = Math.min(100, recentPct * (apiRecentPct / 15)); // Scale from API's base
        finalData[2].value = Math.min(100, gapPct * (apiGapPct / 85)); // Scale from API's base
      }
    }
    
    return finalData;
  };
  
  const getMaterialDataForTab = (materialId: string) => {
    const apiIdMap: { [key: string]: string } = {
      'steel': 'steel',
      'cement': 'cement',
      'aluminum': 'aluminum',
      'copper': 'copper',
      'rare-earths': 'rare_earths'
    };
    const apiId = apiIdMap[materialId] || materialId;
    return materialData && materialData[apiId] ? materialData[apiId] : null;
  };

  const materials = [
    {
      id: 'steel',
      name: 'Steel',
      icon: HardHat,
      color: '#7A8B6F',
      description: 'Steel is a foundational material for data center structures, rebar, server racks, and manufacturing equipment. Its production is highly emissions-intensive, accounting for approximately 7% of global CO₂ emissions.',
      technologies: [
        'Hydrogen Direct Reduction (H₂-DRI): Utilizes green hydrogen to reduce iron ore, producing water vapor instead of CO₂',
        'Molten Oxide Electrolysis: Employs electricity to directly produce iron metal, with oxygen as the primary byproduct'
      ],
      innovators: [
        'Boston Metal: MIT spinout scaling molten oxide electrolysis, raised $51M in July 2025',
        'H₂ Green Steel: Secured EUR 1.5B financing for Europe\'s first industrial-scale green steel plant'
      ],
      investmentData: [
        { name: 'Investment Gap', value: 85, color: '#C4B89A' },
        { name: 'Recent Funding', value: 15, color: '#9CAF88' }
      ],
      investmentText: 'Achieving net-zero steel requires approximately $6 billion per year for low-CO₂ technologies, with an additional $2 trillion for supporting infrastructure through 2050. Despite progress, decarbonization remains stagnant in many regions, with significant investment gaps persisting.',
      impact: 'Replacing coal-based steel with near-zero carbon steel can cut emissions per ton by 85-95%.'
    },
    {
      id: 'cement',
      name: 'Cement & Concrete',
      icon: Factory,
      color: '#C4B89A',
      description: 'Cement is the essential binder in concrete, used extensively in data center foundations, walls, and cooling structures. Cement production contributes approximately 8% of global CO₂ emissions.',
      technologies: [
        'Clinker Substitution: Utilizing lower-carbon binders such as fly ash, slag, or calcined clay',
        'Carbon Curing: Injecting CO₂ into concrete during mixing or curing to permanently mineralize it',
        'Novel Chemistries: Developing new cement formulations that inherently emit less CO₂'
      ],
      innovators: [
        'Carbon Upcycling: Secured $18M funding in June 2025 for carbon capture and utilization technology',
        'Terra CO2: Secured $124.5M in July 2025 to accelerate low-carbon cement alternatives',
        'CarbonCure: Already deploying CO₂ injection systems globally'
      ],
      investmentData: [
        { name: 'Investment Gap', value: 90, color: '#C4B89A' },
        { name: 'Recent Funding', value: 10, color: '#9CAF88' }
      ],
      investmentText: 'Transforming the global cement industry by 2050 will require approximately $1–1.5 trillion in cumulative investment. Recent funding (Terra CO2 $124.5M, Carbon Upcycling $18M) represents only a fraction of the massive investment needed.',
      impact: 'Implementing a portfolio of solutions can achieve 30-70% CO₂ reduction per concrete mix, and cumulatively avoid 98 gigatons of CO₂ from 2022-2050.'
    },
    {
      id: 'aluminum',
      name: 'Aluminum',
      icon: Zap,
      color: '#9CAF88',
      description: 'Aluminum is a key material in data center equipment, including server casings, electrical components, and cooling infrastructure. Its production is highly electricity-intensive.',
      technologies: [
        'Clean Electricity: Utilizing renewable energy sources for smelting, which accounts for approximately 60% of aluminum\'s CO₂ emissions',
        'Inert Anode Technology: Eliminates direct CO₂ emissions by replacing conventional carbon anodes with ceramic materials',
        'Increased Recycling: Recycling aluminum uses only about 5% of the energy required for primary production'
      ],
      innovators: [
        'Elysis: Alcoa and Rio Tinto JV leading inert anode commercialization, Apple purchased first carbon-free aluminum in 2019',
        'Alcoa: Shifted to ESG-driven aluminum with EcoLum product, 50% below industry average carbon footprint'
      ],
      investmentData: [
        { name: 'Investment Gap', value: 80, color: '#C4B89A' },
        { name: 'Recent Funding', value: 20, color: '#9CAF88' }
      ],
      investmentText: 'Fully decarbonizing the global aluminum sector could require cumulative investments ranging from $500 billion to $1.5 trillion. AI data centers are creating massive demand, exposing supply chain resilience vulnerabilities and highlighting the urgent need for investment.',
      impact: 'Using 100% renewable electricity can reduce CO₂ footprint by ~75%; inert anode technology can achieve potentially zero direct CO₂ emissions.'
    },
    {
      id: 'copper',
      name: 'Copper',
      icon: Cpu,
      color: '#D4C9B0',
      description: 'Copper is an indispensable conductor in electrical infrastructure, with data centers containing vast quantities in power cables, bus bars, and circuit boards.',
      technologies: [
        'Catalytic Leaching: Enables extraction of copper from low-grade ores at ambient conditions',
        'Electrifying Smelting: Replacing fossil fuels with clean electricity in pyrometallurgical processes',
        'Enhanced Recycling: Improving technologies for copper recovery from e-waste and other scrap'
      ],
      innovators: [
        'Jetti Resources: Developed breakthrough catalytic leaching process cutting CO₂ emissions by ~40% per unit of copper',
        'Edge Copper Corporation: Formed in July 2025 with $17M financing for Zonia Copper Project in Arizona'
      ],
      investmentData: [
        { name: 'Investment Gap', value: 75, color: '#C4B89A' },
        { name: 'Recent Funding', value: 25, color: '#9CAF88' }
      ],
      investmentText: 'The copper industry requires over $100 billion globally to decarbonize, encompassing new processes and clean power sources. A substantial shortfall in copper supply is widening, with recent funding (Edge Copper $17M) insufficient to address the massive gap.',
      impact: 'A 40% emissions cut via leaching translates to saving approximately 1–2 tons of CO₂ per tonne of copper produced.'
    },
    {
      id: 'rare-earths',
      name: 'Rare Earths',
      icon: Magnet,
      color: '#8B9A7A',
      description: 'Rare earth elements are indispensable for high-efficiency motors in wind turbines, electric vehicles, and data center components. Over 90% of production is currently in China.',
      technologies: [
        'Magnet-to-Magnet Recycling: Reprocessing end-of-life magnets from electronics into new high-performance magnets',
        'Cleaner Processing: Advances in separation chemistry and electrolysis to reduce heavy chemical and thermal steps',
        'Improved Mining Practices: Implementing robust environmental controls and using renewable power'
      ],
      innovators: [
        'Apple & MP Materials: Apple committed $500M in July 2025 for US-made rare earth magnets and recycling facility',
        'Noveon Magnetics: Achieves 90% energy savings compared to traditional magnet manufacturing, raised $75M'
      ],
      investmentData: [
        { name: 'Investment Gap', value: 70, color: '#C4B89A' },
        { name: 'Recent Funding', value: 30, color: '#9CAF88' }
      ],
      investmentText: 'Building a diversified, clean rare earth supply chain requires recreating an industry that largely migrated offshore. The US is narrowing its rare earth gap and could meet 95% of its own demand by 2030, but China will still supply 60% globally. Recent investments include Apple\'s $500M commitment to MP Materials and an $8.5B US-Australia rare earth agreement.',
      impact: 'Recycled magnets exhibit nearly 10× lower energy demand than magnets from mined material, leading to significantly lower CO₂ emissions.'
    }
  ];

  const activeMaterial = materials.find(m => m.id === activeTab);
  // Always get investment data - it has defaults built in, so it will never be empty
  const currentInvestmentData = getInvestmentData(activeTab);
  
  // Update activeMaterial with real investment data
  const materialWithData = activeMaterial ? {
    ...activeMaterial,
    investmentData: currentInvestmentData
  } : null;

  return (
    <section id="solutions" className="py-20" style={{ backgroundColor: '#F5F3ED' }}>
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Solutions: A Deep Dive into Green Materials
          </h2>
          <p className="mt-4 text-lg max-w-4xl mx-auto" style={{ color: '#6B7A5F' }}>
            Decarbonizing "hard-to-abate" sectors is a complex but critical endeavor. This section provides a detailed overview of the key industrial materials, their associated emissions challenges, and the innovative technologies and leading companies driving their decarbonization.
          </p>
        </motion.div>

        <div className="rounded-lg shadow-lg p-4 sm:p-8" style={{ backgroundColor: '#F0EDE5' }}>
          {/* Material Tabs */}
          <div className="flex flex-wrap justify-center -mb-px border-b mb-8" style={{ borderColor: '#C4B89A' }}>
            {materials.map((material) => (
              <button
                key={material.id}
                onClick={() => setActiveTab(material.id)}
                className={`flex items-center space-x-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === material.id
                    ? 'border-[#7A8B6F] text-[#7A8B6F] bg-[#7A8B6F] bg-opacity-10'
                    : 'border-transparent'
                }`}
                style={activeTab !== material.id ? { color: '#7A8B6F' } : {}}
                onMouseEnter={(e) => { if (activeTab !== material.id) { e.currentTarget.style.color = '#5A6B4F'; e.currentTarget.style.borderColor = '#C4B89A'; } }}
                onMouseLeave={(e) => { if (activeTab !== material.id) { e.currentTarget.style.color = '#7A8B6F'; e.currentTarget.style.borderColor = 'transparent'; } }}
              >
                <material.icon className="w-5 h-5" />
                <span>{material.name}</span>
                {(() => {
                  const marketData = getMaterialDataForTab(material.id);
                  return marketData && marketData.market_data ? (
                    <span className="ml-2 text-xs" style={{ color: marketData.market_data.price_change_30d > 0 ? '#7A8B6F' : '#C4B89A' }}>
                      {marketData.market_data.price_change_30d > 0 ? '↑' : '↓'}
                    </span>
                  ) : null;
                })()}
              </button>
            ))}
          </div>

          {/* Material Content */}
          {materialWithData && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div>
                <div className="flex items-center mb-4">
                  <materialWithData.icon className={`w-8 h-8 mr-3`} style={{ color: materialWithData.color }} />
                  <h3 className="text-2xl font-bold">{materialWithData.name}</h3>
                </div>
                
                <p className="mb-6" style={{ color: '#6B7A5F' }}>{materialWithData.description}</p>
                
                <h4 className="font-semibold text-lg mb-3">
                  Key Technologies:
                </h4>
                <ul className="list-disc list-inside space-y-2 mb-6" style={{ color: '#6B7A5F' }}>
                  {materialWithData.technologies.map((tech: string, index: number) => (
                    <li key={index} className="text-sm">{tech}</li>
                  ))}
                </ul>

                <h4 className="font-semibold text-lg mb-3">
                  Leading Innovators:
                </h4>
                <div className="space-y-3">
                  {materialWithData.innovators.map((innovator: string, index: number) => (
                    <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: '#E8E4D8' }}>
                      <p className="text-sm" style={{ color: '#6B7A5F' }}>{innovator}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-center">
                    Investment Snapshot
                  </h4>
                  <button
                    onClick={fetchMaterialData}
                    disabled={loading}
                    className="transition-colors" style={{ color: '#7A8B6F' }} onMouseEnter={(e) => e.currentTarget.style.color = '#5A6B4F'} onMouseLeave={(e) => e.currentTarget.style.color = '#7A8B6F'}
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                
                {/* Investment Metrics Bar Chart - Shows Required, Recent Funding, and Gap */}
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#E8E4D8' }}>
                  <h5 className="text-sm font-semibold mb-2" style={{ color: '#5A6B4F' }}>Investment Metrics</h5>
                  <p className="text-xs mb-3" style={{ color: '#6B7A5F' }}>Comparison of required investment, recent funding secured, and remaining gap</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={currentInvestmentData} layout="horizontal" margin={{ top: 5, right: 40, left: 160, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#C4B89A" />
                      <XAxis 
                        type="number" 
                        domain={[0, 100]} 
                        stroke="#7A8B6F"
                        tick={{ fill: '#5A6B4F', fontSize: 11 }}
                        label={{ value: 'Relative Scale (%)', position: 'insideBottom', offset: -5, style: { fill: '#5A6B4F', fontSize: 11 } }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={150} 
                        stroke="#7A8B6F"
                        tick={{ fill: '#5A6B4F', fontSize: 11 }}
                      />
                      <Tooltip 
                        formatter={(value: number | undefined, name?: string, props?: any) => {
                          // Access the payload data correctly
                          const payload = props?.payload || props;
                          if (payload && payload.formattedValue) {
                            return [payload.formattedValue, payload.name || name || ''];
                          }
                          // Fallback to percentage if no formatted value
                          return [`${value?.toFixed(1) ?? 0}%`, name || ''];
                        }}
                        labelFormatter={() => 'Investment Metrics'}
                        contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: '4px', padding: '10px' }}
                        cursor={{ fill: 'rgba(196, 184, 154, 0.1)' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {currentInvestmentData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#7A8B6F'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Price Trend Line Chart */}
                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#E8E4D8' }}>
                  <h5 className="text-sm font-semibold mb-2" style={{ color: '#5A6B4F' }}>Price Trend (90 Days)</h5>
                  {(() => {
                    const marketData = getMaterialDataForTab(activeTab);
                    const historical = marketData?.market_data?.historical;
                    
                    if (historical && Array.isArray(historical) && historical.length > 0) {
                      try {
                        // Parse and format historical data
                        const chartData = historical
                          .filter((item: any) => item && item.date && item.price !== undefined && item.price !== null)
                          .map((item: any) => {
                            const date = new Date(item.date);
                            if (isNaN(date.getTime())) {
                              return null;
                            }
                            return {
                              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                              price: parseFloat(item.price),
                              fullDate: date // Keep for sorting
                            };
                          })
                          .filter((item: any) => item !== null)
                          .sort((a: any, b: any) => a.fullDate.getTime() - b.fullDate.getTime()); // Sort by date
                        
                        if (chartData.length > 0) {
                          return (
                            <>
                              <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={chartData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#C4B89A" />
                                  <XAxis 
                                    dataKey="date" 
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                    interval="preserveStartEnd"
                                    stroke="#7A8B6F"
                                    tick={{ fill: '#5A6B4F', fontSize: 10 }}
                                  />
                                  <YAxis 
                                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft', style: { fill: '#5A6B4F', fontSize: 11 } }}
                                    stroke="#7A8B6F"
                                    tick={{ fill: '#5A6B4F', fontSize: 11 }}
                                  />
                                  <Tooltip 
                                    formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Price']}
                                    labelFormatter={(label) => `Date: ${label}`}
                                    contentStyle={{ backgroundColor: '#F5F3ED', border: '1px solid #C4B89A', borderRadius: '4px', padding: '8px' }}
                                  />
                                  <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke={materialWithData?.color || '#7A8B6F'} 
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: materialWithData?.color || '#7A8B6F' }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                              {marketData && marketData.market_data && (
                                <p className="text-xs mt-2 text-center" style={{ color: '#7A8B6F' }}>
                                  Market: {marketData.market_data.source || 'N/A'} | 
                                  Current: ${marketData.market_data.current_price?.toFixed(2) || 'N/A'} | 
                                  Change: {marketData.market_data.price_change_30d?.toFixed(1) || 'N/A'}% (30d) | 
                                  Data Points: {chartData.length}
                                </p>
                              )}
                            </>
                          );
                        }
                      } catch (error) {
                        console.error('Error processing historical data:', error);
                      }
                    }
                    
                    // Show loading/error message
                    return (
                      <div className="text-center py-8" style={{ color: '#7A8B6F' }}>
                        <p className="mb-2">Price data loading...</p>
                        {marketData && marketData.market_data ? (
                          <p className="text-xs">Source: {marketData.market_data.source || 'Fetching data...'}</p>
                        ) : (
                          <p className="text-xs">Click "Refresh Data" button to fetch latest price trends.</p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: '#D4C9B0' }}>
                  <h5 className="font-semibold mb-2" style={{ color: '#5A6B4F' }}>Investment Requirements:</h5>
                  <p className="text-sm" style={{ color: '#6B7A5F' }}>{materialWithData.investmentText}</p>
                </div>

                <div className="p-4 rounded-lg" style={{ backgroundColor: '#B8C5A6' }}>
                  <h5 className="font-semibold mb-2" style={{ color: '#5A6B4F' }}>Climate Impact:</h5>
                  <p className="text-sm" style={{ color: '#6B7A5F' }}>{materialWithData.impact}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Key Insights */}
        <motion.div 
          className="mt-16 p-8 rounded-lg border" style={{ backgroundColor: '#E8E4D8', borderColor: '#C4B89A' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#5A6B4F' }}>
              The Investment Opportunity
            </h3>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#6B7A5F' }}>
              The technologies to decarbonize heavy materials are emerging, but they need a big first customer or investor to reach scale and drive down costs. Hyperscalers can play that role, just as they did for renewable electricity. By investing early, tech companies can help scale up innovative low-carbon technologies and gain preferential access or pricing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionsSection;
