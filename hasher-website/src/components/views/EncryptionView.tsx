import { useState } from 'react';
import TheoryPanel from '../TheoryPanel';
import encryptionData from '../../assets/data/encryption.json';

type KeyPanelMode = 'symmetric' | 'asymmetric' | 'stream';

const ENCRYPTION_CONFIG = encryptionData as Record<
  'aes' | 'chacha' | 'rsa' | 'ecc',
  {
    label: string;
    mode: KeyPanelMode;
    keyLabel: string;
    keyPlaceholder: string;
    showNonce: boolean;
    nonceLabel: string;
    noncePlaceholder: string;
    showSalt: boolean;
    saltLabel: string;
    saltPlaceholder: string;
    showCounter: boolean;
    counterLabel?: string;
    counterPlaceholder?: string;
    showCustomKeys: boolean;
    keyOptions?: string[];
  }
>;
const EncryptionView = () => {
  const [algo, setAlgo] = useState<'aes' | 'chacha' | 'rsa' | 'ecc'>('aes');
  const [encryptionInput, setEncryptionInput] = useState('');
  const [symmetricKey, setSymmetricKey] = useState('');
  const [nonce, setNonce] = useState('');
  const [salt, setSalt] = useState('');
  const [counter, setCounter] = useState('0');
  const [keySelection, setKeySelection] = useState('Use Public Key (for Encryption)');
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [cipherOutput, setCipherOutput] = useState('');

  const config = ENCRYPTION_CONFIG[algo];
  const keyOptions = algo === 'rsa' || algo === 'ecc' ? ENCRYPTION_CONFIG[algo].keyOptions ?? [] : [];

  return (
    <section className="tool-section">
      <div className="workspace">
        <h2>Data Encryption & Decryption</h2>
        
        <div className="control-group">
          <label htmlFor="algo-select">Cryptographic Algorithm</label>
          <select 
            id="algo-select" 
            value={algo} 
            onChange={(e) => setAlgo(e.target.value as 'aes' | 'chacha' | 'rsa' | 'ecc')}
          >
            <optgroup label="Symmetric Ciphers">
              <option value="aes">AES-256 (GCM Mode)</option>
              <option value="chacha">ChaCha20</option>
            </optgroup>
            <optgroup label="Asymmetric Ciphers">
              <option value="rsa">RSA-2048</option>
              <option value="ecc">ECC (secp256r1)</option>
            </optgroup>
          </select>
        </div>

        <div className="control-group">
          <label>Input Data</label>
          <textarea
            placeholder="Enter plaintext or ciphertext here..."
            rows={6}
            value={encryptionInput}
            onChange={(event) => setEncryptionInput(event.target.value)}
          />
        </div>

        {config.mode === 'symmetric' && (
          <div className="control-group">
            <label>{config.keyLabel}</label>
            <input
              type="password"
              placeholder={config.keyPlaceholder}
              value={symmetricKey}
              onChange={(event) => setSymmetricKey(event.target.value)}
            />
          </div>
        )}

        {config.mode === 'stream' && (
          <div className="control-group">
            <label>{config.keyLabel}</label>
            <input
              type="text"
              placeholder={config.keyPlaceholder}
              value={symmetricKey}
              onChange={(event) => setSymmetricKey(event.target.value)}
            />
          </div>
        )}

        {config.showNonce && (
          <div className="control-group">
            <label>{config.nonceLabel}</label>
            <input
              type="text"
              placeholder={config.noncePlaceholder}
              value={nonce}
              onChange={(event) => setNonce(event.target.value)}
            />
          </div>
        )}

        {config.showCounter && (
          <div className="control-group">
            <label>{config.counterLabel}</label>
            <input
              type="number"
              min={0}
              step={1}
              value={counter}
              onChange={(event) => setCounter(event.target.value)}
              placeholder={config.counterPlaceholder}
            />
          </div>
        )}

        {config.showSalt && (
          <div className="control-group">
            <label>{config.saltLabel}</label>
            <input
              type="text"
              placeholder={config.saltPlaceholder}
              value={salt}
              onChange={(event) => setSalt(event.target.value)}
            />
          </div>
        )}

        {config.mode === 'asymmetric' && (
          <>
            <div className="control-group">
              <label>{config.keyLabel}</label>
              <select value={keySelection} onChange={(event) => setKeySelection(event.target.value)}>
                {keyOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Public Key</label>
              <textarea
                placeholder="Enter or paste a public key..."
                rows={4}
                value={publicKey}
                onChange={(event) => setPublicKey(event.target.value)}
              />
            </div>

            <div className="control-group">
              <label>Private Key</label>
              <textarea
                placeholder="Enter or paste a private key..."
                rows={4}
                value={privateKey}
                onChange={(event) => setPrivateKey(event.target.value)}
              />
            </div>
          </>
        )}

        <div className="action-buttons">
          <button className="primary-btn">Encrypt Data</button>
          <button className="secondary-btn">Decrypt Data</button>
        </div>

        <div className="control-group">
          <label>Output</label>
          <textarea
            placeholder="Result will appear here..."
            readOnly
            rows={6}
            value={cipherOutput}
            onChange={(event) => setCipherOutput(event.target.value)}
          />
        </div>
      </div>

      <TheoryPanel blocks={encryptionData.theory[algo]} />
    </section>
  );
};

export default EncryptionView;