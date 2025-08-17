import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, DollarSign, Users, Award } from 'lucide-react';

const StakesSection: React.FC = () => {
  const [activePrecedent, setActivePrecedent] = useState('renewables');

  const precedents = [
    {
      id: 'renewables',
      title: 'Tech\'s Renewable Energy Push (2010s)',
      description: 'Major tech companies initiated long-term Power Purchase Agreements (PPAs) for renewable energy, effectively paying an initial premium to stimulate and expand the market for clean power.',
      result: 'Corporate clean energy purchasing surged 100-fold within ten years, while solar costs plummeted by approximately 71% and wind power by 47%, fundamentally transforming the global electricity industry.',
      icon: '⚡'
    },
    {
      id: 'ibm',
      title: 'IBM\'s "Bet-the-Business" System/360 (1964)',
      description: 'IBM made an audacious $5 billion investment (over $35 billion in today\'s currency) to develop the System/360 mainframe computer family.',
      result: 'By 1966, IBM was shipping 1,000 System/360 units monthly, and the architecture became the de facto standard for decades, cementing IBM\'s dominance of the IT industry.',
      icon: '💻'
    },
    {
      id: 'amazon',
      title: 'Amazon\'s Infrastructure-First Growth Strategy (2000s)',
      description: 'Amazon famously operated for years with minimal profit, relentlessly reinvesting revenue into long-term infrastructure: warehouses, distribution networks, and cloud data centers.',
      result: 'These early, costly investments profoundly shaped today\'s e-commerce and cloud computing landscapes, establishing Amazon\'s global dominance.',
      icon: '📦'
    }
  ];

  const costsOfInaction = [
    {
      title: 'Regulatory & Market Penalties',
      description: 'Failure to act exposes companies to escalating future carbon costs and compliance burdens.',
      example: 'New York City\'s Local Law 97 (effective Jan 2024) imposes significant penalties on large buildings exceeding emissions limits.',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Higher Long-Term Costs',
      description: 'Delaying investment in green materials can paradoxically lead to increased costs later.',
      example: 'Forcing companies to pay for expensive offsets or procure scarce, high-cost low-carbon inputs when regulations become unavoidable.',
      icon: DollarSign,
      color: 'text-red-600'
    },
    {
      title: 'Loss of Talent & Culture Erosion',
      description: 'Companies visibly lagging in sustainability efforts may struggle to attract and retain top-tier talent.',
      example: 'A 2023 Deloitte survey indicated over 40% of Gen Z and Millennials are willing to change jobs due to corporate climate stance.',
      icon: Users,
      color: 'text-red-600'
    },
    {
      title: 'Reputational Damage',
      description: 'Intensifying scrutiny over corporate climate claims means perceived "greenwashing" can severely erode brand trust.',
      example: 'Leading to public backlash, boycotts, and negative press that impact market capitalization.',
      icon: AlertTriangle,
      color: 'text-red-600'
    }
  ];

  const rewardsOfLeadership = [
    {
      title: 'Secure, Climate-Aligned Supply Chains',
      description: 'Early investment ensures future raw materials are secure from carbon-related disruptions.',
      benefit: 'Fewer surprises from carbon pricing, no scrambling to find compliant suppliers when new laws hit.',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Competitive Advantage & Market Leadership',
      description: 'Firms that move first set the industry agenda and enjoy preferential access and pricing.',
      benefit: 'Being a pioneer allows building internal expertise that can become a consultancy or service in itself.',
      icon: Award,
      color: 'text-green-600'
    },
    {
      title: 'Long-Term Cost Savings & Efficiency',
      description: 'While initial projects require capital, over the long run clean energy and processes can be cheaper.',
      benefit: 'Renewable electricity often costs less to operate than fossil energy, and green processes reduce exposure to volatile commodity prices.',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Reputation and Brand Value Accrual',
      description: 'Companies seen as part of the solution enjoy stronger brand loyalty and less risk of public backlash.',
      benefit: 'Being known as the first tech company to build all its products from truly carbon-neutral materials creates immense PR value.',
      icon: Award,
      color: 'text-green-600'
    }
  ];

  return (
    <section id="stakes" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The High Stakes: Risk vs. Reward
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            The decision to pursue bold, transformative investment or maintain the status quo carries significant implications. The path of inaction is fraught with escalating financial, operational, and reputational risks, whereas historical precedents demonstrate that visionary leadership and strategic long-term investment can yield profound competitive advantages and market dominance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Costs of Inaction */}
          <motion.div 
            className="bg-red-50 p-8 rounded-lg border-l-4 border-red-500"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-red-700 mb-6 text-center flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              The Cost of Inaction
            </h3>
            <div className="space-y-4">
              {costsOfInaction.map((cost, index) => (
                <motion.div 
                  key={cost.title}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <cost.icon className={`w-5 h-5 mt-1 flex-shrink-0 ${cost.color}`} />
                  <div>
                    <strong className="block text-red-800">{cost.title}:</strong>
                    <p className="text-red-700 text-sm mt-1">{cost.description}</p>
                    <p className="text-red-600 text-sm mt-1 italic">{cost.example}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Rewards of Leadership */}
          <motion.div 
            className="bg-green-50 p-8 rounded-lg border-l-4 border-green-500"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-green-700 mb-6 text-center flex items-center justify-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              The Rewards of Leadership
            </h3>
            
            {/* Historical Precedents Tabs */}
            <div className="mb-6">
              <div className="flex justify-center border-b border-green-200 mb-4">
                {precedents.map((precedent) => (
                  <button
                    key={precedent.id}
                    onClick={() => setActivePrecedent(precedent.id)}
                    className={`py-2 px-4 text-sm font-semibold focus:outline-none transition-colors duration-200 ${
                      activePrecedent === precedent.id
                        ? 'text-green-700 border-b-2 border-green-700'
                        : 'text-green-500 hover:text-green-700'
                    }`}
                  >
                    {precedent.icon} {precedent.title.split(' ')[0]}
                  </button>
                ))}
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                {precedents.map((precedent) => (
                  <div
                    key={precedent.id}
                    className={`${activePrecedent === precedent.id ? 'block' : 'hidden'}`}
                  >
                    <h4 className="font-bold text-lg text-green-800 mb-2">
                      {precedent.title}
                    </h4>
                    <p className="text-green-700 text-sm mb-2">{precedent.description}</p>
                    <p className="text-green-600 text-sm font-semibold">Result: {precedent.result}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Benefits */}
            <div className="space-y-3">
              {rewardsOfLeadership.map((reward, index) => (
                <motion.div 
                  key={reward.title}
                  className="flex items-start space-x-3"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <reward.icon className={`w-5 h-5 mt-1 flex-shrink-0 ${reward.color}`} />
                  <div>
                    <strong className="block text-green-800">{reward.title}</strong>
                    <p className="text-green-700 text-sm mt-1">{reward.description}</p>
                    <p className="text-green-600 text-sm mt-1 italic">{reward.benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Key Takeaway */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              The Time to Act is Now
            </h3>
            <p className="text-blue-700 text-lg max-w-3xl mx-auto">
              The next few years (2025-2030) are the window for action to set heavy industry on a new course. 
              Hyperscale data center firms, due to their scale and resources, have an outsized ability—and arguably 
              responsibility—to act in this window. Inaction means likely missing climate targets and facing both 
              higher costs and climate damages later. Action now means seizing a leadership role in a historic 
              industrial transformation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StakesSection;
