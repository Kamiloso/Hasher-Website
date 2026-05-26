import { useState } from 'react';
import TheoryPanel from '../TheoryPanel';
import crackingData from '../../assets/data/cracking.json';

const CrackingView = () => {
  const [attackMode, setAttackMode] = useState<'dictionary' | 'brute-force' | 'hybrid'>('dictionary');
  const theoryKey = attackMode === 'brute-force' ? 'bruteForce' : attackMode;
  const modeOptions = crackingData.modeOptions as Array<{ value: 'dictionary' | 'brute-force' | 'hybrid'; label: string }>;

  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>Password Cracking Lab</h2>

        <div className="control-group">
          <label htmlFor="attack-mode">Attack Mode</label>
          <select
            id="attack-mode"
            value={attackMode}
            onChange={(e) => setAttackMode(e.target.value as 'dictionary' | 'brute-force' | 'hybrid')}
          >
            {modeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="target-hash">Target Hash</label>
          <textarea id="target-hash" placeholder="Paste the hash to analyze..." rows={4} />
        </div>

        <div className="control-group">
          <label htmlFor="wordlist">Wordlist / Candidate Set</label>
          <textarea id="wordlist" placeholder="Enter likely passwords, one per line..." rows={5} />
        </div>

        {attackMode !== 'dictionary' && (
          <div className="control-group">
            <label htmlFor="charset">Character Set</label>
            <input id="charset" type="text" defaultValue="abcdefghijklmnopqrstuvwxyz0123456789" />
          </div>
        )}

        <div className="action-buttons">
          <button className="primary-btn">Start Attack</button>
          <button className="secondary-btn">Stop</button>
        </div>

        <div className="control-group">
          <label>Result</label>
          <textarea
            placeholder="Cracking progress and recovered passwords will appear here..."
            readOnly
            rows={5}
          />
        </div>
      </div>

      <TheoryPanel blocks={crackingData.theory[theoryKey]} />
    </section>
  );
};

export default CrackingView;