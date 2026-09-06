import { useState } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import ShowDontTell from '@/components/ShowDontTell';
import Features from '@/components/Features';
import DashboardMockup from '@/components/DashboardMockup';
import RadarScout from '@/components/RadarScout';
import CTA from '@/components/CTA';
import FAQ, { Footer } from '@/components/FAQ';
import Dashboard from '@/components/Dashboard'; // Import your agent dashboard

function App() {
  // Tracks the user's name. If empty, show the landing page.
  const [activeUser, setActiveUser] = useState('');

  // If a name has been entered, swap the screen entirely to the Dashboard
  if (activeUser) {
    return <Dashboard userName={activeUser} />;
  }

  // Otherwise, render the original Bolt landing page
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <Navbar onStart={(name) => setActiveUser(name)} />
      <main>
        {/* Pass the name handler into Hero so the Continue button catches it */}
        <Hero onStart={(name) => setActiveUser(name)} />
        <HowItWorks />
        <ShowDontTell />
        <Features />
        <DashboardMockup />
        <RadarScout />
        <CTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;