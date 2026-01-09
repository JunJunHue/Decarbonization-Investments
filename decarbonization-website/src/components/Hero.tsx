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
    <section className="py-20 h-screen" style={{ background: 'linear-gradient(to bottom right, #F5F3ED, #F0EDE5, #E8E4D8)' }}>
      <div className="container mx-auto px-6 text-center h-full flex flex-col justify-center">
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
            className="transition-colors duration-300 animate-bounce"
            style={{ color: '#7A8B6F' }}
          >
            <ChevronDown className="w-8 h-8 mx-auto" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
