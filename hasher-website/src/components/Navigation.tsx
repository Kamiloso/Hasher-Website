export type TabType = 'encrypt' | 'hash';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navigation = ({ activeTab, setActiveTab }: NavigationProps) => {
  return (
    <nav className="tab-navigation">
      <button
        type="button"
        className={`tab-btn ${activeTab === 'encrypt' ? 'active' : ''}`}
        onClick={() => setActiveTab('encrypt')}
      >
        Encryption
      </button>
      <button 
        type="button"
        className={`tab-btn ${activeTab === 'hash' ? 'active' : ''}`}
        onClick={() => setActiveTab('hash')}
      >
        Hashing
      </button>
    </nav>
  );
};

export default Navigation;