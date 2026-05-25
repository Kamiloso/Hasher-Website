export type TabType = 'encrypt' | 'hash' | 'crack';

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
        Encryption / Decryption
      </button>
      <button 
        type="button"
        className={`tab-btn ${activeTab === 'hash' ? 'active' : ''}`}
        onClick={() => setActiveTab('hash')}
      >
        Hashing Algorithms
      </button>
      <button 
        type="button"
        className={`tab-btn ${activeTab === 'crack' ? 'active' : ''}`}
        onClick={() => setActiveTab('crack')}
      >
        Password Cracking
      </button>
    </nav>
  );
};

export default Navigation;