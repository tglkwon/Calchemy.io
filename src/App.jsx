import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameProvider';
import { AssetProvider } from './context/AssetProvider';
import { GameDataProvider } from './context/GameDataProvider';
import { useAsset } from './context/AssetContext';
import BattlePage from './pages/BattlePage';
import LogPage from './pages/LogPage';
import DeckPage from './pages/DeckPage';
import RelicPage from './pages/RelicPage';
import MapPage from './pages/MapPage';

const NavBar = () => {
  const location = useLocation();
  const { mode, toggleMode } = useAsset();

  const isActive = (path) => location.pathname === path ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800';

  return (
    <nav className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-yellow-500 mr-4">Alchemy Auto-Battler</h1>
        <Link to="/" className={`px-3 py-2 rounded transition-colors ${isActive('/')}`}>전투</Link>
        <Link to="/map" className={`px-3 py-2 rounded transition-colors ${isActive('/map')}`}>지도</Link>
        <Link to="/log" className={`px-3 py-2 rounded transition-colors ${isActive('/log')}`}>로그</Link>
        <Link to="/deck" className={`px-3 py-2 rounded transition-colors ${isActive('/deck')}`}>덱 구성</Link>
        <Link to="/relic" className={`px-3 py-2 rounded transition-colors ${isActive('/relic')}`}>유물</Link>
      </div>
      <button
        onClick={toggleMode}
        className="px-4 py-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 text-sm transition-colors"
      >
        모드: {mode === 'EMOJI' ? '이모지' : '이미지'}
      </button>
    </nav>
  );
};

function App() {
  return (
    <GameDataProvider>
      <GameProvider>
        <AssetProvider>
          <Router>
            <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
              <NavBar />
              <main className="container mx-auto p-4 h-[calc(100vh-64px)] overflow-hidden">
                <Routes>
                  <Route path="/" element={<BattlePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/log" element={<LogPage />} />
                  <Route path="/deck" element={<DeckPage />} />
                  <Route path="/relic" element={<RelicPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AssetProvider>
      </GameProvider>
    </GameDataProvider>
  );
}

export default App;
