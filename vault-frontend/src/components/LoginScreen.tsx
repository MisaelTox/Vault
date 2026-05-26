import { useState } from 'react';
import { vaultApi } from '../api/axios';

const USERS = [
  { name: 'Tox',    color: '#00B63A' },
  { name: 'Jedis',  color: '#FC3D41' },
  { name: 'Chango', color: '#003087' },
];

interface Props {
  onLogin: (username: string) => void;
}

export const LoginScreen = ({ onLogin }: Props) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedUser = USERS.find(u => u.name === selected);

  const handleSelectUser = (name: string) => {
    setSelected(name);
    setPin('');
    setError('');
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      submitPin(next);
    }
  };

  const handleDelete = () => setPin(prev => prev.slice(0, -1));

  const submitPin = async (code: string) => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      await vaultApi.login(selected, code);
      localStorage.setItem('vault_user', selected);
      onLogin(selected);
    } catch {
      setError('PIN incorrecto');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (pin.length === 4) submitPin(pin);
  };

  return (
    <div style={{
      backgroundColor: '#F2F2F2',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '32px',
      fontFamily: "'Selecta', system-ui, -apple-system, sans-serif",
    }}>
      <style>{`
        body, #root { margin: 0; padding: 0; background: #F2F2F2; }
        .user-card {
          background: white;
          border: none;
          border-radius: 8px;
          padding: 20px 16px;
          color: #1B1B1B;
          cursor: pointer;
          width: 96px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          font-family: inherit;
          transition: box-shadow 0.15s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .user-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
        .user-card.selected { outline: 2px solid #2C61FF; }
        .user-initial {
          width: 48px; height: 48px;
          border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          color: white;
          font-size: 22px; font-weight: 700;
        }
        .user-name {
          font-size: 14px; font-weight: 600; color: #1B1B1B; margin: 0;
        }
        .pin-dot {
          width: 14px; height: 14px; border-radius: 50%;
          transition: background-color 0.15s;
        }
        .key-btn {
          background: white; border: none; border-radius: 8px;
          color: #1B1B1B; font-size: 22px; font-weight: 600;
          width: 72px; height: 72px; cursor: pointer;
          font-family: inherit;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          transition: box-shadow 0.1s, background 0.1s;
        }
        .key-btn:active { background: #F2F2F2; }
        .key-btn.secondary { font-size: 14px; color: #6E6E6E; }
        .submit-btn {
          width: 200px; padding: 14px;
          border-radius: 8px; border: none;
          font-size: 16px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background 0.2s;
        }
        .submit-btn:disabled { cursor: default; }
      `}</style>

      {/* Logo */}
      <svg width="82" height="72" viewBox="0 0 55 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M27.5 0C35.8769 0 43.2037 4.33454 47.4619 10.8398C49.1314 10.9365 50.7479 11.5526 52.0684 12.6338C53.9239 14.1532 54.9999 16.425 55 18.8232V20.4111C55 21.7018 54.6913 22.9196 54.1484 23.999C54.6945 25.0851 55 26.3067 55 27.5889V29.1768C54.9999 31.575 53.9239 33.8468 52.0684 35.3662C50.7485 36.4468 49.1326 37.0621 47.4639 37.1592C43.2051 43.6654 35.8768 48 27.5 48C19.1232 48 11.7949 43.6654 7.53613 37.1592C5.86742 37.0621 4.25154 36.4468 2.93164 35.3662C1.07607 33.8468 0.000110671 31.575 0 29.1768V27.5889C0 26.307 0.305784 25.0858 0.851562 24C0.305783 22.9142 0 21.693 0 20.4111V18.8232C0.000111526 16.425 1.07607 14.1532 2.93164 12.6338C4.2521 11.5526 5.86857 10.9365 7.53809 10.8398C11.7963 4.33454 19.1231 0 27.5 0ZM27.5 8C20.2288 8 14.0882 12.9456 12.208 19.6709L8 18.8232V20.4111L17.9268 22.3906V25.6104L8 27.5889V29.1768L12.2061 28.3291C14.0862 35.0544 20.2288 40 27.5 40C34.7712 40 40.9138 35.0544 42.7939 28.3291L47 29.1768V27.5889L37.0732 25.6094V22.3896L47 20.4102V18.8232L42.792 19.6709C40.9706 13.1559 35.151 8.31127 28.1787 8.01465L27.5 8ZM27.8887 14.4678C31.8813 14.6309 35.2417 17.296 36.4707 20.9434L29.5527 22.3379V25.6621L36.4727 27.0566C35.2039 30.8216 31.6621 33.54 27.5 33.54C23.3379 33.54 19.7947 30.8231 18.5273 27.0566L25.4473 25.6621V22.3379L18.5293 20.9434C19.7966 17.1782 23.3378 14.46 27.5 14.46L27.8887 14.4678Z" fill="white" fillOpacity="0.5"/>
        <path d="M47 20.4113V18.8236L42.7921 19.6706C40.9119 12.9453 34.7712 8 27.5 8C20.2288 8 14.088 12.9453 12.2079 19.6706L8 18.8236V20.4113L17.9268 22.3908V25.6106L8 27.5887V29.1764L12.2065 28.3294C14.0866 35.0547 20.2288 40 27.5 40C34.7712 40 40.9134 35.0547 42.7935 28.3294L47 29.1764V27.5887L37.0732 25.6092V22.3894L47 20.4098V20.4113ZM27.5 33.5403C23.3377 33.5403 19.7941 30.8229 18.5269 27.0562L25.4474 25.6623V22.3377L18.5297 20.9438C19.7969 17.1785 23.3377 14.4597 27.5 14.4597C31.6623 14.4597 35.2016 17.1785 36.4703 20.9438L29.5526 22.3377V25.6623L36.4731 27.0562C35.2045 30.8215 31.6623 33.5403 27.5 33.5403Z" fill="#1B1B1B"/>
      </svg>

      {!selected ? (
        <>
          <p style={{ margin: 0, color: '#6E6E6E', fontSize: '16px', fontWeight: 600 }}>
            ¿Quién eres?
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            {USERS.map(user => (
              <button
                key={user.name}
                className="user-card"
                onClick={() => handleSelectUser(user.name)}
              >
                <div className="user-initial" style={{ background: user.color }}>
                  {user.name[0]}
                </div>
                <span className="user-name">{user.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Selected user */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div
              className="user-initial"
              style={{ background: selectedUser?.color, width: 56, height: 56, fontSize: 26, borderRadius: 4 }}
            >
              {selected[0]}
            </div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '18px', color: '#1B1B1B' }}>{selected}</p>
          </div>

          {/* PIN dots */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="pin-dot"
                style={{ backgroundColor: i < pin.length ? (selectedUser?.color ?? '#2C61FF') : '#BCBCBC' }}
              />
            ))}
          </div>

          {error && (
            <p style={{ margin: 0, color: '#FC3D41', fontSize: '14px', fontWeight: 600 }}>{error}</p>
          )}

          {/* Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {['1','2','3','4','5','6','7','8','9'].map(d => (
              <button key={d} className="key-btn" onClick={() => handlePinDigit(d)}>{d}</button>
            ))}
            <button className="key-btn secondary" onClick={() => setSelected(null)}>← Volver</button>
            <button className="key-btn" onClick={() => handlePinDigit('0')}>0</button>
            <button className="key-btn secondary" onClick={handleDelete}>⌫</button>
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={pin.length !== 4 || loading}
            style={{
              backgroundColor: pin.length === 4 ? '#2C61FF' : '#BCBCBC',
              color: 'white',
            }}
          >
            {loading ? '...' : 'Entrar'}
          </button>
        </>
      )}
    </div>
  );
};
