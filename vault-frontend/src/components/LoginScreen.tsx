import { useState } from 'react';
import { vaultApi } from '../api/axios';

const USERS = [
  { name: 'Tox',    emoji: '🐲' },
  { name: 'Jedis',  emoji: '⚔️' },
  { name: 'Chango', emoji: '🦧' },
];

interface Props {
  onLogin: (username: string) => void;
}

export const LoginScreen = ({ onLogin }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectUser = (name: string) => {
    setSelected(name);
    setPin('');
    setError('');
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    setPin(prev => prev + digit);
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const handleSubmit = async () => {
    if (!selected || pin.length !== 4) return;
    setLoading(true);
    setError('');
    try {
      await vaultApi.login(selected, pin);
      localStorage.setItem('vault_user', selected);
      onLogin(selected);
    } catch {
      setError('PIN incorrecto');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#121212', color: 'white', minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px', gap: '32px',
    }}>
      <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '800' }}>🗃️ Vault</h1>

      {!selected ? (
        <>
          <p style={{ margin: 0, color: '#888', fontSize: '15px' }}>¿Quién eres?</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {USERS.map(user => (
              <button
                key={user.name}
                onClick={() => handleSelectUser(user.name)}
                style={{
                  background: '#1e1e1e', border: '1px solid #333',
                  borderRadius: '16px', padding: '20px 16px',
                  color: 'white', cursor: 'pointer', width: '100px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                }}
              >
                <span style={{ fontSize: '36px' }}>{user.emoji}</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{user.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '48px' }}>
              {USERS.find(u => u.name === selected)?.emoji}
            </span>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '18px' }}>{selected}</p>
          </div>

          {/* Puntos del PIN */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: '16px', height: '16px', borderRadius: '50%',
                backgroundColor: i < pin.length ? '#3b82f6' : '#333',
                transition: 'background-color 0.15s',
              }} />
            ))}
          </div>

          {error && <p style={{ margin: 0, color: '#ef4444', fontSize: '14px' }}>{error}</p>}

          {/* Teclado numérico */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} onClick={() => handlePinDigit(d)} style={keyStyle}>{d}</button>
            ))}
            <button onClick={() => setSelected(null)} style={{ ...keyStyle, color: '#888', fontSize: '13px' }}>←</button>
            <button onClick={() => handlePinDigit('0')} style={keyStyle}>0</button>
            <button onClick={handleDelete} style={{ ...keyStyle, color: '#888' }}>⌫</button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || loading}
            style={{
              width: '200px', padding: '14px', borderRadius: '12px',
              backgroundColor: pin.length === 4 ? '#3b82f6' : '#1e1e1e',
              color: 'white', border: 'none', fontWeight: 'bold',
              fontSize: '16px', cursor: pin.length === 4 ? 'pointer' : 'default',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? '...' : 'Entrar'}
          </button>
        </>
      )}
    </div>
  );
};

const keyStyle: React.CSSProperties = {
  background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px',
  color: 'white', fontSize: '22px', fontWeight: 'bold',
  width: '72px', height: '72px', cursor: 'pointer',
};
