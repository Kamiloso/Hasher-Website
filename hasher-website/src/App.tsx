import { useEffect, useState } from 'react';
import './App.css';
import Navigation, { type TabType } from './components/Navigation';
import EncryptionPresenter from './components/presenters/EncryptionPresenter';
import HashingPresenter from './components/presenters/HashingPresenter';

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
    document.title = 'Encryption & Hashing Algorithms';
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-top">
          <div className="header-copy">
            <p className="eyebrow">Interactive cryptography studio</p>
            <h1>Encryption &amp; Hashing Algorithms</h1>
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
        <section hidden={activeTab !== 'encrypt'} aria-hidden={activeTab !== 'encrypt'}>
          <EncryptionPresenter />
        </section>
        <section hidden={activeTab !== 'hash'} aria-hidden={activeTab !== 'hash'}>
          <HashingPresenter />
        </section>
      </main>
    </div>
  );
}

export default App;
