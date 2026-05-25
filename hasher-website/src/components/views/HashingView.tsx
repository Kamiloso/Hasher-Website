import { useState } from 'react';
import TheoryPanel from '../TheoryPanel';
import hashingData from '../../assets/data/hashing.json';

const HASH_CONFIG = hashingData.config as Record<
  'sha256' | 'argon2' | 'md5',
  {
    label: string;
    saltPolicy: 'optional' | 'recommended' | 'none';
    saltLabel: string;
    defaultSalt: string;
    defaultKdf: 'none' | 'pbkdf2' | 'scrypt' | 'argon2';
    allowKdf: boolean;
  }
>;

const KDF_OPTIONS = hashingData.kdfOptions as Array<{ value: 'none' | 'pbkdf2' | 'scrypt'; label: string }>;

const HashingView = () => {
  const [hashAlgo, setHashAlgo] = useState<'sha256' | 'argon2' | 'md5'>('sha256');
  const [kdf, setKdf] = useState<'none' | 'pbkdf2' | 'scrypt' | 'argon2'>('none');
  const [iterations, setIterations] = useState(100000);
  const [salt, setSalt] = useState('');

  const config = HASH_CONFIG[hashAlgo];
  const showSalt = config.saltPolicy !== 'none';
  const showKdf = config.allowKdf || hashAlgo === 'sha256';
  const effectiveKdf = hashAlgo === 'argon2' ? 'argon2' : kdf;

  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>Data Hashing</h2>
        
        <div className="control-group">
          <label htmlFor="hash-select">Hash Function</label>
          <select 
            id="hash-select" 
            value={hashAlgo} 
            onChange={(e) => setHashAlgo(e.target.value as 'sha256' | 'argon2' | 'md5')}
          >
            <option value="sha256">SHA-256</option>
            <option value="argon2">Argon2 (Password Hashing)</option>
            <option value="md5">MD5 (Legacy / Insecure)</option>
          </select>
        </div>

        {showKdf && (
          <div className="control-group">
            <label htmlFor="kdf-select">KDF</label>
            <select
              id="kdf-select"
              value={effectiveKdf}
              onChange={(e) => setKdf(e.target.value as 'none' | 'pbkdf2' | 'scrypt' | 'argon2')}
              disabled={hashAlgo === 'argon2'}
            >
              {hashAlgo === 'argon2' ? (
                <option value="argon2">Argon2 (built-in)</option>
              ) : (
                KDF_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              )}
            </select>
          </div>
        )}

        {showKdf && effectiveKdf === 'pbkdf2' && (
          <div className="control-group">
            <label htmlFor="iterations">PBKDF2 Iterations</label>
            <input
              id="iterations"
              type="number"
              min={1000}
              step={1000}
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value) || 1000)}
            />
          </div>
        )}

        <div className="control-group">
          <label>Input Data</label>
          <textarea placeholder="Enter string to hash..." rows={4}></textarea>
        </div>

        {showSalt && (
          <div className="control-group">
            <label>{config.saltLabel}</label>
            <input
              type="text"
              placeholder={
                hashAlgo === 'argon2'
                  ? 'Enter cryptographic salt...'
                  : 'Enter salt if you want one...'
              }
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
            />
          </div>
        )}

        <div className="action-buttons">
          <button className="primary-btn">Compute Hash</button>
        </div>

        <div className="control-group">
          <label>Hash Output (Hexadecimal)</label>
          <textarea placeholder="Computed hash will appear here..." readOnly rows={3}></textarea>
        </div>
      </div>

      <TheoryPanel blocks={hashingData.theory[hashAlgo]} />
    </section>
  );
};

export default HashingView;