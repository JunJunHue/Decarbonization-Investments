import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '#why', label: 'The Why' },
    { href: '#stakes', label: 'The Stakes' },
    { href: '#solutions', label: 'The Solutions' },
    { href: '#players', label: 'The Players' },
    { href: '#strategy', label: 'The Strategy' },
    { href: '#predictor', label: 'Demand Predictor' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="backdrop-blur-lg shadow-sm sticky top-0 z-50 transition-all duration-300" style={{ backgroundColor: 'rgba(245, 243, 237, 0.8)' }}>
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <a href="#" className="text-xl font-bold" style={{ color: '#5A6B4F' }}>
          HyperScale, HyperImpact
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="font-medium transition-colors duration-200" style={{ color: '#6B7A5F' }} onMouseEnter={(e) => e.currentTarget.style.color = '#5A6B4F'} onMouseLeave={(e) => e.currentTarget.style.color = '#6B7A5F'}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: '#F5F3ED', borderColor: '#C4B89A' }}>
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => scrollToSection(item.href)}
              className="block w-full text-left py-3 px-6 text-sm transition-colors duration-200" style={{ color: '#6B7A5F' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8E4D8'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
