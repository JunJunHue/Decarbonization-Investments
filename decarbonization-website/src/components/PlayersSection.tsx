import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, TrendingUp, Leaf, Zap, Building, Globe } from 'lucide-react';

const PlayersSection: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const companies = [
    {
      id: 'google',
      name: 'Google',
      logo: 'https://placehold.co/150x80/F5E6E6/D4A5A5?text=Google',
      color: '#7A8B6F',
      climateGoal: 'Net-zero emissions across all operations and value chain by 2030',
      keyInitiatives: [
        'Joined the Sustainable Steel Buyers Platform in 2023',
        'Participates in the First Movers Coalition',
        'Pilots low-carbon concrete and recycled materials in data center construction',
        'Focuses on embodied carbon in data center construction'
      ],
      recentActions: [
        'Uses supplementary cementitious materials (like coal fly ash) to reduce clinker content',
        'Continuously refines building standards to cut material usage',
        'Circular Economy commitments to reuse or recycle 100% of servers'
      ],
      investmentFocus: 'Supplier engagement and procurement coalitions',
      icon: Globe
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      logo: 'https://placehold.co/150x80/F5E6E6/D4A5A5?text=Microsoft',
      color: '#7A8B6F',
      climateGoal: 'Carbon negative by 2030, removing all CO₂ ever emitted by 2050',
      keyInitiatives: [
        'Established $1 billion Climate Innovation Fund',
        'Invested in CarbonCure, Prometheus Materials, and Boston Metal',
        'Building data centers using cross-laminated timber (CLT) instead of concrete and steel',
        'Founding member of the Sustainable Steel Buyers Platform'
      ],
      recentActions: [
        'Pioneering hybrid timber-concrete designs cutting embodied carbon by 35-65%',
        'Testing concrete mixes achieving over 50% carbon reduction',
        'Engaging hardware manufacturers to use recycled and low-carbon components'
      ],
      investmentFocus: 'Direct venture investments and pilot projects',
      icon: Building
    },
    {
      id: 'meta',
      name: 'Meta',
      logo: 'https://placehold.co/150x80/F5E6E6/D4A5A5?text=Meta',
      color: '#7A8B6F',
      climateGoal: 'Net-zero emissions across value chain by 2030, net-zero embodied carbon in new buildings by 2030',
      keyInitiatives: [
        'Leader in low-carbon concrete deployment',
        'Partnered with CarbonBuilt via purchase agreement',
        'Providing carbon financing to CarbiCrete',
        'Applied AI research to optimize concrete formulations'
      ],
      recentActions: [
        'Systematically redesigned data center projects to use less concrete',
        'Eliminated unnecessary concrete in certain designs, cutting volume by >30%',
        'Incorporated requirements for all new builds to use low-carbon concrete',
        'Achieved ~20% intensity reduction immediately in new builds'
      ],
      investmentFocus: 'Technology partnerships and carbon financing',
      icon: Zap
    },
    {
      id: 'apple',
      name: 'Apple',
      logo: 'https://placehold.co/150x80/F5E6E6/D4A5A5?text=Apple',
      color: '#7A8B6F',
      climateGoal: '100% carbon neutrality for supply chain and products by 2030',
      keyInitiatives: [
        'Invested in Elysis joint venture for carbon-free aluminum',
        'Issued $4.7 billion in green bonds for low-carbon manufacturing',
        'Pioneered direct investment in upstream green tech among big tech firms',
        'Committed $500M to MP Materials for US-made rare earth magnets'
      ],
      recentActions: [
        'Procured the world\'s first carbon-free aluminum in 2019',
        'Incorporated carbon-free aluminum into certain device lines (iPhone SE)',
        'Aiming for 100% recycled rare earth elements in all magnets by 2025',
        'Developed new alloys to use more recycled content without quality loss'
      ],
      investmentFocus: 'Direct equity investments and green bonds',
      icon: Leaf
    }
  ];

  const openModal = (companyId: string) => {
    setActiveModal(companyId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <section id="players" className="py-20" style={{ backgroundColor: '#F0EDE5' }}>
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Players: Hyperscalers in Action
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            The world's leading technology companies are not merely setting ambitious climate targets; they are actively pioneering the direct investment model in upstream decarbonization. Their initiatives serve as powerful proofs of concept, demonstrating the feasibility and strategic benefits of this approach.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              className="text-center cursor-pointer group"
              onClick={() => openModal(company.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className="rounded-lg shadow-lg p-6 transition-all duration-300 group-hover:shadow-xl" style={{ backgroundColor: '#F5F3ED' }}>
                <img 
                  src={company.logo} 
                  alt={`${company.name} Logo`} 
                  className="mx-auto rounded-lg transition-transform duration-300 group-hover:scale-105"
                />
                <div className="mt-4">
                  <company.icon className={`w-8 h-8 mx-auto mb-2`} style={{ color: company.color }} />
                  <p className="font-semibold text-lg" style={{ color: '#5A6B4F' }}>{company.name}</p>
                  <p className="text-sm mt-1" style={{ color: '#7A8B6F' }}>Click to learn more</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key Insights */}
        <motion.div 
          className="mt-16 p-8 rounded-lg border" style={{ backgroundColor: '#F5E6E6', borderColor: '#E8D4D4' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4" style={{ color: '#E8D4D4' }}>
              The Power of Corporate Leadership
            </h3>
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#E8D4D4' }}>
              These companies have the financial muscle to deploy capital at a scale that matches the $3.5 trillion per year investment the global net-zero transition requires. By acting as market makers for green commodities, they can replicate their success with renewable energy and accelerate the decarbonization of heavy industry.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Company Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="rounded-lg shadow-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#F5F3ED' }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const company = companies.find(c => c.id === activeModal);
                if (!company) return null;

                return (
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center space-x-4">
                        <img src={company.logo} alt={`${company.name} Logo`} className="w-20 h-12 rounded" />
                        <h3 className="text-3xl font-bold" style={{ color: company.color }}>
                          {company.name}
                        </h3>
                      </div>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold text-xl mb-4" style={{ color: '#5A6B4F' }}>
                          Climate Goal
                        </h4>
                        <p className="mb-6 p-4 rounded-lg border-l-4" style={{ backgroundColor: '#E8E4D8', borderColor: '#7A8B6F', color: '#6B7A5F' }}>
                          {company.climateGoal}
                        </p>

                        <h4 className="font-bold text-xl mb-4" style={{ color: '#5A6B4F' }}>
                          Key Initiatives
                        </h4>
                        <ul className="space-y-3">
                          {company.keyInitiatives.map((initiative, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#7A8B6F' }}></div>
                              <span style={{ color: '#6B7A5F' }}>{initiative}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-xl mb-4" style={{ color: '#5A6B4F' }}>
                          Recent Actions
                        </h4>
                        <ul className="space-y-3 mb-6">
                          {company.recentActions.map((action, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#7A8B6F' }}></div>
                              <span style={{ color: '#6B7A5F' }}>{action}</span>
                            </li>
                          ))}
                        </ul>

                        <h4 className="font-bold text-xl mb-4" style={{ color: '#5A6B4F' }}>
                          Investment Focus
                        </h4>
                        <p className="p-4 rounded-lg border-l-4" style={{ backgroundColor: '#E8E4D8', borderColor: '#7A8B6F', color: '#6B7A5F' }}>
                          {company.investmentFocus}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#E8E4D8' }}>
                      <h4 className="font-bold text-lg mb-2" style={{ color: '#5A6B4F' }}>Strategic Impact</h4>
                      <p className="text-sm" style={{ color: '#6B7A5F' }}>
                        {company.name} demonstrates how hyperscalers can leverage their procurement power and capital to achieve economies of scale for nascent decarbonization technologies. Their approach serves as a template for other companies looking to accelerate their climate goals through upstream investment.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PlayersSection;
