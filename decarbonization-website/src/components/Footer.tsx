import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="py-12" style={{ backgroundColor: '#5A6B4F', color: '#F5F3ED' }}>
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
            <p className="text-lg max-w-4xl mx-auto" style={{ color: '#E8E4D8' }}>
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
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8E4D8' }}>Innovation</h3>
            <p className="text-sm" style={{ color: '#D4C9B0' }}>
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
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8E4D8' }}>Global Impact</h3>
            <p className="text-sm" style={{ color: '#D4C9B0' }}>
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
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#E8E4D8' }}>Growth</h3>
            <p className="text-sm" style={{ color: '#D4C9B0' }}>
              Building new markets and opportunities in the green economy
            </p>
          </motion.div>
        </div>

        <div className="border-t pt-8 text-center" style={{ borderColor: '#7A8B6F' }}>
          <p className="text-sm" style={{ color: '#D4C9B0' }}>
            © 2025 HyperScale, HyperImpact. Building the climate-aligned supply chain of the future.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
