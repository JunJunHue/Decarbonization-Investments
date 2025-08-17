import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToWhy = () => {
    const element = document.querySelector('#why');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-6 text-center">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold text-[#333333] leading-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          HyperScale, HyperImpact
        </motion.h1>
        
        <motion.p 
          className="mt-4 text-lg md:text-xl text-gray-600 max-w-4xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Catalyzing a Green Industrial Revolution Through Upstream Tech Investment
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={scrollToWhy}
            className="bg-[#4A5568] text-white font-bold rounded-lg px-8 py-4 hover:bg-opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Explore the Investment Case
          </button>
        </motion.div>

        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <button
            onClick={scrollToWhy}
            className="text-gray-500 hover:text-[#4A5568] transition-colors duration-300 animate-bounce"
          >
            <ChevronDown className="w-8 h-8 mx-auto" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
