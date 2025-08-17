import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Shield, Award, Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

const WhySection: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const emissionsData = [
    { name: 'Cement Production', value: 8, color: '#8A9A5B' },
    { name: 'Iron & Steel Production', value: 7, color: '#E29B7F' },
    { name: 'Other Global Emissions', value: 85, color: '#87CEEB' }
  ];

  const strategicDrivers = [
    {
      id: 'regulatory',
      title: 'Regulatory Insulation',
      description: 'Proactively mitigate future carbon taxes and compliance burdens, such as the EU\'s Carbon Border Adjustment Mechanism (CBAM).',
      icon: Shield,
      details: `The global regulatory landscape for environmental impact is tightening, presenting both challenges and opportunities. Companies that proactively invest in decarbonizing their supply chains will gain significant insulation from future regulatory shocks. This strategic move effectively "climate-proofs" the supply chain, acting as a vital form of insurance against future carbon taxes, trade tariffs, and potential supply disruptions in an increasingly decarbonizing global economy.`,
      example: `Example: The European Union's Carbon Border Adjustment Mechanism (CBAM), set to impose costs on carbon-intensive imports like steel, cement, and aluminum starting in 2026. Firms that fail to reduce their embedded emissions will face direct financial penalties, as they will be required to purchase carbon certificates for high-carbon materials.`
    },
    {
      id: 'reputation',
      title: 'Brand Leadership',
      description: 'Enhance corporate reputation among discerning consumers, investors, and top-tier talent.',
      icon: Award,
      details: `Bold climate action, particularly upstream in the supply chain, significantly enhances corporate reputation among a broad spectrum of stakeholders, including consumers, investors, and prospective talent. There is a growing demand for sustainability, especially among younger generations. By visibly championing the use of green steel or carbon-free aluminum in their products and infrastructure, tech companies powerfully reinforce their brands and build trust.`,
      example: `Data Point: A 2023 Deloitte survey revealed that over 40% of Gen Z and Millennials have either changed jobs or plan to do so due to climate concerns, and more than half actively research a company's environmental policies before joining. A PwC 2024 survey indicated that consumers are willing to pay an average of 9.7% more for sustainably produced or sourced goods.`
    },
    {
      id: 'control',
      title: 'Control Over Goals',
      description: 'Gain direct, verifiable control over emissions reductions to reliably achieve net-zero targets.',
      icon: Target,
      details: `Direct investment upstream provides companies with a level of control over emissions reductions that is otherwise unattainable within their operational boundaries. Conventional Scope 3 approaches often rely on indirect and inherently unreliable measures, such as merely encouraging suppliers to act or purchasing carbon offsets of varying quality. Many suppliers in heavy industries, operating on thin margins, frequently lack the capital to invest in expensive green technologies without significant external support.`,
      example: `In stark contrast, if a hyperscaler actively helps finance a green steel plant or a low-carbon cement facility, it directly ensures a reliable supply of climate-aligned materials. This locks in tangible emissions reductions that directly advance the company's net-zero goals.`
    },
    {
      id: 'resilience',
      title: 'Supply Chain Resilience',
      description: 'Reduce exposure to volatile fossil-based commodity prices and geopolitical supply risks.',
      icon: Zap,
      details: `The evolving climate and geopolitical landscape introduces new and significant risks to raw material supply chains. Fossil-based commodity supply chains, such as steel, are inherently volatile, with prices frequently fluctuating based on coal and electricity costs. Furthermore, the mining of critical materials like rare earths is often geographically concentrated in a few regions, presenting both environmental and political vulnerabilities.`,
      example: `Investing in greener production methods—such as steel manufactured with renewable energy or recycled materials, or supporting novel mining and recycling techniques for critical minerals—can effectively diversify and stabilize supply sources.`
    }
  ];

  const handleCardClick = (cardId: string) => {
    setActiveCard(activeCard === cardId ? null : cardId);
  };

  return (
    <section id="why" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Next Frontier in Climate Leadership
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            While major technology companies have committed to ambitious climate goals, a significant challenge persists in addressing their "embodied carbon." This refers to the substantial Scope 3 emissions generated during the production of heavy industrial materials like steel and cement that form the backbone of our digital infrastructure. This section delves into why direct, proactive upstream investment is a strategic imperative to address this critical environmental and business challenge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold text-center mb-6">The Scale of the Problem</h3>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={emissionsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {emissionsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Global CO₂ Emissions']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <p className="text-center text-gray-500 mt-4 text-sm">
                Combined CO₂ contribution from Steel and Cement production to global emissions.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {strategicDrivers.map((driver, index) => (
              <motion.div
                key={driver.id}
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => handleCardClick(driver.id)}
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-3">
                  <driver.icon className="w-6 h-6 text-[#4A5568] mr-2" />
                  <h4 className="font-bold text-lg">{driver.title}</h4>
                </div>
                <p className="text-gray-600 text-sm mb-3">{driver.description}</p>
                
                {activeCard === driver.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t pt-3 mt-3"
                  >
                    <p className="text-gray-700 text-sm mb-2">{driver.details}</p>
                    <p className="text-gray-600 text-sm italic">{driver.example}</p>
                  </motion.div>
                )}
                
                <div className="text-[#4A5568] text-xs mt-2">
                  {activeCard === driver.id ? 'Click to collapse' : 'Click to expand'}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Additional Context from Research */}
        <motion.div 
          className="mt-16 bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-4 text-center">Why This Matters Now</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                The Urgency
              </h4>
              <p className="text-gray-700">
                The world must cut greenhouse emissions 43% by 2030 to avert the worst outcomes, which demands transformative changes, not just efficiency tweaks. For many tech firms, upstream "Scope 3" emissions (from suppliers and raw materials) account for the vast majority of their carbon footprint.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                The Opportunity
              </h4>
              <p className="text-gray-700">
                Instead of treating clean materials as someone else's problem, tech giants can leverage their capital and influence to make steel, cement, aluminum, and other commodities green from the outset, fundamentally restructuring supply chains to align with climate goals.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhySection;
