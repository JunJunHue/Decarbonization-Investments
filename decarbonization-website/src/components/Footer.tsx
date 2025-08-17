import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Globe, TrendingUp } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#333333] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-4">
              It is imperative to apply the "moonshot mindset" to the foundational building blocks of our global economy.
            </h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              The corporations that lead this transformative charge will not only contribute significantly to planetary sustainability but will also emerge as the architects and beneficiaries of the new, green industrial revolution.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Lightbulb className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Innovation</h3>
            <p className="text-gray-400 text-sm">
              Pioneering new technologies and approaches to decarbonize heavy industry
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Globe className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Impact</h3>
            <p className="text-gray-400 text-sm">
              Creating systemic change that benefits the entire planet and economy
            </p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <TrendingUp className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Growth</h3>
            <p className="text-gray-400 text-sm">
              Building new markets and opportunities in the green economy
            </p>
          </motion.div>
        </div>

        <div className="border-t border-gray-600 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 HyperScale, HyperImpact. Building the climate-aligned supply chain of the future.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
