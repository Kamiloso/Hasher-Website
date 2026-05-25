import { useEffect, useState } from 'react';
import './App.css';
import Navigation, { type TabType } from './components/Navigation';
import EncryptionView from './components/views/EncryptionView';
import HashingView from './components/views/HashingView';
import CrackingView from './components/views/CrackingView';

const getInitialTheme = () => {
  const storedTheme = window.localStorage.getItem('theme');

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('encrypt');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.title = 'Interactive Cryptography Studio';
  }, []);

  const renderView = () => {
    switch (activeTab) {
      case 'encrypt': return <EncryptionView />;
      case 'hash': return <HashingView />;
      case 'crack': return <CrackingView />;
      default: return null;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <div className="header-copy">
            <p className="eyebrow">Interactive cryptography studio</p>
            <h1>Interactive Cryptography Studio</h1>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <span className="theme-toggle__icon" aria-hidden="true">
              {theme === 'dark' ? '◐' : '◑'}
            </span>
            <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
          </button>
        </div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </header>

      <main className="app-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;