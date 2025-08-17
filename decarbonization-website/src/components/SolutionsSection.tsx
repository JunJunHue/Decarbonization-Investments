import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  HardHat, 
  Droplets, 
  Zap, 
  Cpu, 
  Magnet, 
  TrendingUp, 
  DollarSign,
  Leaf,
  Factory,
  Gauge
} from 'lucide-react';

const SolutionsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('steel');

  const materials = [
    {
      id: 'steel',
      name: 'Steel',
      icon: HardHat,
      color: '#8A9A5B',
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
        { name: 'Investment Gap', value: 100, color: '#E29B7F' },
        { name: 'Recent Funding', value: 25, color: '#8A9A5B' }
      ],
      investmentText: 'Achieving net-zero steel requires approximately $6 billion per year for low-CO₂ technologies, with an additional $2 trillion for supporting infrastructure through 2050.',
      impact: 'Replacing coal-based steel with near-zero carbon steel can cut emissions per ton by 85-95%.'
    },
    {
      id: 'cement',
      name: 'Cement & Concrete',
      icon: Factory,
      color: '#E29B7F',
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
        { name: 'Investment Gap', value: 100, color: '#E29B7F' },
        { name: 'Recent Funding', value: 15, color: '#8A9A5B' }
      ],
      investmentText: 'Transforming the global cement industry by 2050 will require approximately $1–1.5 trillion in cumulative investment.',
      impact: 'Implementing a portfolio of solutions can achieve 30-70% CO₂ reduction per concrete mix, and cumulatively avoid 98 gigatons of CO₂ from 2022-2050.'
    },
    {
      id: 'aluminum',
      name: 'Aluminum',
      icon: Zap,
      color: '#87CEEB',
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
        { name: 'Investment Gap', value: 100, color: '#E29B7F' },
        { name: 'Recent Funding', value: 30, color: '#8A9A5B' }
      ],
      investmentText: 'Fully decarbonizing the global aluminum sector could require cumulative investments ranging from $500 billion to $1.5 trillion.',
      impact: 'Using 100% renewable electricity can reduce CO₂ footprint by ~75%; inert anode technology can achieve potentially zero direct CO₂ emissions.'
    },
    {
      id: 'copper',
      name: 'Copper',
      icon: Cpu,
      color: '#D2B48C',
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
        { name: 'Investment Gap', value: 100, color: '#E29B7F' },
        { name: 'Recent Funding', value: 10, color: '#8A9A5B' }
      ],
      investmentText: 'The copper industry requires over $100 billion globally to decarbonize, encompassing new processes and clean power sources.',
      impact: 'A 40% emissions cut via leaching translates to saving approximately 1–2 tons of CO₂ per tonne of copper produced.'
    },
    {
      id: 'rare-earths',
      name: 'Rare Earths',
      icon: Magnet,
      color: '#4A5568',
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
        { name: 'Investment Gap', value: 100, color: '#E29B7F' },
        { name: 'Recent Funding', value: 40, color: '#8A9A5B' }
      ],
      investmentText: 'Building a diversified, clean rare earth supply chain requires recreating an industry that largely migrated offshore.',
      impact: 'Recycled magnets exhibit nearly 10× lower energy demand than magnets from mined material, leading to significantly lower CO₂ emissions.'
    }
  ];

  const activeMaterial = materials.find(m => m.id === activeTab);

  return (
    <section id="solutions" className="py-20 bg-gray-50">
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
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            Decarbonizing "hard-to-abate" sectors is a complex but critical endeavor. This section provides a detailed overview of the key industrial materials, their associated emissions challenges, and the innovative technologies and leading companies driving their decarbonization.
          </p>
        </motion.div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
          {/* Material Tabs */}
          <div className="flex flex-wrap justify-center -mb-px border-b border-gray-200 mb-8">
            {materials.map((material) => (
              <button
                key={material.id}
                onClick={() => setActiveTab(material.id)}
                className={`flex items-center space-x-2 py-3 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === material.id
                    ? 'border-[#4A5568] text-[#4A5568] bg-[#4A5568] bg-opacity-10'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <material.icon className="w-5 h-5" />
                <span>{material.name}</span>
              </button>
            ))}
          </div>

          {/* Material Content */}
          {activeMaterial && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <div>
                <div className="flex items-center mb-4">
                  <activeMaterial.icon className={`w-8 h-8 mr-3`} style={{ color: activeMaterial.color }} />
                  <h3 className="text-2xl font-bold">{activeMaterial.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{activeMaterial.description}</p>
                
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <Leaf className="w-5 h-5 text-green-600 mr-2" />
                  Key Technologies:
                </h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
                  {activeMaterial.technologies.map((tech, index) => (
                    <li key={index} className="text-sm">{tech}</li>
                  ))}
                </ul>

                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
                  Leading Innovators:
                </h4>
                <div className="space-y-3">
                  {activeMaterial.innovators.map((innovator, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-700 text-sm">{innovator}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-center mb-4 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                  Investment Snapshot
                </h4>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={activeMaterial.investmentData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value}B`, 'Investment']}
                        labelFormatter={() => 'Investment Gap vs Recent Funding'}
                      />
                      <Bar dataKey="value" fill={activeMaterial.color} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">Investment Requirements:</h5>
                  <p className="text-blue-700 text-sm">{activeMaterial.investmentText}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">Climate Impact:</h5>
                  <p className="text-green-700 text-sm">{activeMaterial.impact}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Key Insights */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 p-8 rounded-lg border border-purple-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <Gauge className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-purple-800 mb-4">
              The Investment Opportunity
            </h3>
            <p className="text-purple-700 text-lg max-w-4xl mx-auto">
              The technologies to decarbonize heavy materials are emerging, but they need a big first customer or investor to reach scale and drive down costs. Hyperscalers can play that role, just as they did for renewable electricity. By investing early, tech companies can help scale up innovative low-carbon technologies and gain preferential access or pricing.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SolutionsSection;
