import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RenterView from './pages/RenterView';
import ProviderView from './pages/ProviderView';
import Dashboard from './pages/Dashboard';
import HeliaTest from './components/HeliaTest';



function App() {
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Router>
        <Navbar />
        <main className="p-4 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/renter" element={<RenterView />} />
            <Route path="/provider" element={<ProviderView />} />
            <Route path="/heliatest" element={<HeliaTest />} /> {/* Peer Sync Test Route */}
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;
