import React from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import WhySection from './components/WhySection';
import StakesSection from './components/StakesSection';
import SolutionsSection from './components/SolutionsSection';
import PlayersSection from './components/PlayersSection';
import StrategySection from './components/StrategySection';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <WhySection />
        <StakesSection />
        <SolutionsSection />
        <PlayersSection />
        <StrategySection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
