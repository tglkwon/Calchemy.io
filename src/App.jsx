import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameProvider';
import { AssetProvider } from './context/AssetProvider';
import { GameDataProvider } from './context/GameDataProvider';
import { useAsset } from './context/AssetContext';
import { useAudio } from './context/AudioContext';
import { AudioProvider } from './context/AudioProvider';
import BattlePage from './pages/BattlePage';
import LogPage from './pages/LogPage';
import DeckPage from './pages/DeckPage';
import RelicPage from './pages/RelicPage';
import MapPage from './pages/MapPage';
import ShopPage from './pages/ShopPage';
import EventPage from './pages/EventPage';
import RewardPage from './pages/RewardPage';
import GlobalStatusBar from './components/GlobalStatusBar';

const NavBar = () => {
  const location = useLocation();
  const { mode, toggleMode } = useAsset();
  const { volume, setVolume, isMuted, setIsMuted } = useAudio();

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
        <Link to="/shop" className={`px-3 py-2 rounded transition-colors ${isActive('/shop')}`}>상점</Link>
        <Link to="/event" className={`px-3 py-2 rounded transition-colors ${isActive('/event')}`}>이벤트</Link>
      </div>

      <div className="flex items-center gap-6">
        {/* Audio Controls */}
        <div className="flex items-center gap-3 bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-gray-400 hover:text-white transition-colors"
            title={isMuted ? "음소거 해제" : "음소거"}
          >
            {isMuted || volume === 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.707 14.707a1 1 0 01-1.414 0 1 1 0 010-1.414 3 3 0 000-4.242 1 1 0 011.414-1.414 5 5 0 010 7.071z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M17.536 17.536a1 1 0 01-1.414 0 1 1 0 010-1.414 7 7 0 000-9.9 1 1 0 011.414-1.414 9 9 0 010 12.728z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (parseFloat(e.target.value) > 0) setIsMuted(false);
            }}
            className="w-20 h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        <button
          onClick={toggleMode}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 text-sm transition-colors text-gray-200"
        >
          모드: {mode === 'EMOJI' ? '이모지' : '이미지'}
        </button>
      </div>
    </nav>
  );
};


function App() {
  return (
    <GameDataProvider>
      <GameProvider>
        <AssetProvider>
          <Router>
            <AudioProvider>
              <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
                <NavBar />
                <div className="sticky top-0 z-50">
                  <GlobalStatusBar />
                </div>
                <main className="container mx-auto p-4 h-[calc(100vh-120px)] overflow-hidden">
                  <Routes>
                    <Route path="/" element={<BattlePage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/log" element={<LogPage />} />
                    <Route path="/deck" element={<DeckPage />} />
                    <Route path="/relic" element={<RelicPage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/event" element={<EventPage />} />
                    <Route path="/reward" element={<RewardPage />} />
                  </Routes>
                </main>
              </div>
            </AudioProvider>
          </Router>
        </AssetProvider>
      </GameProvider>
    </GameDataProvider>
  );
}

export default App;
