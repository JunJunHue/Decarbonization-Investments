import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Settings, 
  MessageSquare, 
  BarChart3, 
  Rocket,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react';

const StrategySection: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const strategySteps = [
    {
      id: 1,
      title: 'Form Collaborative Investment Coalitions',
      description: 'Proactively pool financial resources to establish dedicated funds or initiatives specifically targeting green industrial ventures.',
      details: 'This collaborative approach allows for shared risk mitigation in early-stage industrial investments and facilitates the alignment on common standards for low-carbon materials, ensuring broader market benefits. Imagine a "Sustainable Data Center Materials Fund" where Google, Microsoft, Meta, Apple, and possibly Amazon, IBM, etc. each contribute capital.',
      icon: Users,
      color: 'bg-blue-500',
      examples: [
        'Pool resources to create a dedicated fund targeting green infrastructure',
        'Invest in 8-10 promising ventures across different sectors',
        'Share risk and align on standards for low-carbon materials'
      ]
    },
    {
      id: 2,
      title: 'Scale Demand with Offtake Agreements',
      description: 'Underpin ambitious climate goals with concrete and binding purchase commitments.',
      details: 'Companies should conduct thorough material usage audits and publicly commit to quantifiable procurement targets. Replicating the highly successful renewable Power Purchase Agreement (PPA) strategy, these commitments de-risk projects for producers by guaranteeing market demand.',
      icon: FileText,
      color: 'bg-green-500',
      examples: [
        'Commit to "50% of our structural steel purchases will be near-zero CO₂ by 2030"',
        'Purchase X tons of carbon-neutral aluminum, even at a premium',
        'Guarantee demand to enable producer financing for new plants'
      ]
    },
    {
      id: 3,
      title: 'Integrate into Procurement & Design',
      description: 'Systematically embed low-carbon material requirements directly into Requests for Proposals (RFPs) for new construction projects and hardware procurement.',
      details: 'This creates a strong pull-through effect, compelling suppliers to innovate. Concurrently, internal design teams should actively explore alternative structural designs, such as utilizing mass timber or employing smarter engineering principles to reduce overall material usage.',
      icon: Settings,
      color: 'bg-purple-500',
      examples: [
        'Specify low-carbon concrete and steel requirements in RFPs',
        'Set embodied carbon thresholds for new projects',
        'Explore alternative designs like mass timber or optimized engineering'
      ]
    },
    {
      id: 4,
      title: 'Advocate for Supportive Policy',
      description: 'While pursuing private initiatives, hyperscalers should actively advocate for public policies that support industrial decarbonization.',
      details: 'This includes lobbying for stricter building codes incorporating embodied carbon limits, advocating for increased R&D funding for industrial decarbonization technologies, and promoting green public procurement standards where governments prioritize low-carbon materials.',
      icon: MessageSquare,
      color: 'bg-orange-500',
      examples: [
        'Lobby for stricter building codes on embodied carbon',
        'Advocate for increased R&D funding for industrial decarbonization',
        'Promote green public procurement standards'
      ]
    },
    {
      id: 5,
      title: 'Ensure Transparency and Measurement',
      description: 'To ensure credibility and accurately track progress, companies must rigorously measure and publicly report the embodied carbon of their new projects and products.',
      details: 'Transparently showcasing tangible improvements builds accountability and strengthens the case for continued investment among all stakeholders. This kind of quantification will help build the case to continue or expand such investments.',
      icon: BarChart3,
      color: 'bg-red-500',
      examples: [
        'Measure and report embodied carbon per MW of data center capacity',
        'Track progress: "decreased by 30% from 2025 to 2030"',
        'Create accountability and showcase benefits of investments'
      ]
    }
  ];

  const toggleStep = (stepId: number) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <section id="strategy" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Strategy: A Path Forward for Investors
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-4xl mx-auto">
            To catalyze a green industrial revolution and secure long-term competitive advantage, investors and hyperscalers must translate ambition into concrete action. These five strategic recommendations outline a robust framework for building the climate-aligned supply chain of the future.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {strategySteps.map((step, index) => (
              <motion.div
                key={step.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => toggleStep(step.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {step.id}. {step.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {expandedStep === step.id ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-200 p-6 bg-gray-50"
                  >
                    <p className="text-gray-700 mb-4">{step.details}</p>
                    
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                      Practical Examples:
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {step.examples.map((example, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 text-sm">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Implementation Timeline */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg border border-blue-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Implementation Timeline
            </h3>
            <p className="text-blue-700 text-lg max-w-3xl mx-auto">
              The next few years (2025-2030) are the window for action to set heavy industry on a new course. 
              Here's how the strategy unfolds:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h4 className="font-bold text-blue-800 mb-2">Immediate (2025-2026)</h4>
                <p className="text-blue-700 text-sm">
                  Form coalitions, conduct material audits, establish initial procurement targets
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">2</span>
                </div>
                <h4 className="font-bold text-green-800 mb-2">Short-term (2026-2028)</h4>
                <p className="text-green-700 text-sm">
                  Deploy first investments, pilot new materials, establish supply relationships
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-purple-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold text-lg">3</span>
                </div>
                <h4 className="font-bold text-purple-800 mb-2">Long-term (2028-2030)</h4>
                <p className="text-purple-700 text-sm">
                  Scale successful solutions, achieve climate targets, establish market leadership
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 p-8 rounded-lg text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Rocket className="w-16 h-16 mx-auto mb-6 text-white" />
          <h3 className="text-3xl font-bold mb-4">
            Ready to Lead the Green Industrial Revolution?
          </h3>
          <p className="text-xl mb-6 max-w-3xl mx-auto">
            The companies that act now will not only help save the planet—they will also be the architects 
            of the new, green industrial revolution, and beneficiaries of the thriving markets that revolution creates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Start Your Journey
            </button>
            <button className="border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </motion.div>

        {/* Key Success Factors */}
        <motion.div 
          className="mt-16 bg-white p-8 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-8">
            <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Keys to Success
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-3">What Makes This Strategy Work</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Leverages existing procurement power and capital</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Creates market certainty for innovators</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Builds on proven renewable energy playbook</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Addresses the biggest Scope 3 challenge</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg text-gray-800 mb-3">Expected Outcomes</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Accelerated decarbonization timeline by 5-10 years</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Reduced green premium through scale and learning</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Enhanced competitive positioning and brand value</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Creation of new revenue streams and partnerships</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StrategySection;
