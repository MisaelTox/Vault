import { useEffect, useState } from 'react';
import { vaultApi } from './api/axios';
import { VideoModal } from './components/VideoModal';
import type { Game } from './types/game';

function App() {
  const [vault, setVault] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'vault'>('vault');
  const [flippedCard, setFlippedCard] = useState<string | null>(null);

  useEffect(() => { loadVault(); }, []);

  const loadVault = async () => {
    try {
      const res = await vaultApi.getVault();
      setVault(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async () => {
    if (!search) return;
    try {
      const res = await vaultApi.searchGames(search);
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAdd = async (id: number) => {
    try {
      await vaultApi.addToVault(id, "Tox");
      setActiveTab('vault');
      loadVault();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await vaultApi.deleteGame(id);
      loadVault();
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ 
      backgroundColor: '#121212', color: 'white', minHeight: '100vh', 
      width: '100vw', margin: 0, padding: 0, overflowX: 'hidden',
      display: 'flex', flexDirection: 'column'
    }}>
      
      <style>{`
        body, #root { margin: 0; padding: 0; width: 100%; }
        .full-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          padding: 15px;
          width: 100%;
          box-sizing: border-box;
        }
        .flip-card { 
          background-color: transparent; 
          aspect-ratio: 2 / 3; 
          perspective: 1000px; 
          width: 100%;
        }
        .flip-card-inner { 
          position: relative; width: 100%; height: 100%; 
          transition: transform 0.6s, scale 0.3s; 
          transform-style: preserve-3d; 
        }
        .flip-card.flipped .flip-card-inner { 
          transform: rotateY(180deg);
          scale: 1.05;
        }
        .flip-card-front, .flip-card-back { 
          position: absolute; width: 100%; height: 100%; 
          -webkit-backface-visibility: hidden; backface-visibility: hidden; 
          border-radius: 12px; overflow: hidden; 
        }
        .flip-card-back { 
          background-color: #1e1e1e; transform: rotateY(180deg); 
          display: flex; flex-direction: column; justify-content: space-between; 
          padding: 15px; border: 1px solid #3b82f6; 
          box-sizing: border-box;
          text-align: left;
        }
      `}</style>

      <header style={{ padding: '25px 20px 10px 20px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>
          {activeTab === 'vault' ? 'My Vault' : 'Discovery'}
        </h1>
      </header>

      <main style={{ flex: 1, width: '100%' }}>
        {activeTab === 'search' ? (
          <>
            <div style={{ display: 'flex', gap: '8px', padding: '15px', width: '100%', boxSizing: 'border-box' }}>
              <input 
                type="text" placeholder="Search games..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#222', color: 'white', fontSize: '16px' }}
              />
              <button onClick={handleSearch} style={{ padding: '0 20px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}>
                Go
              </button>
            </div>
            
            <div className="full-grid">
              {searchResults.map(game => (
                <div key={game.externalId} style={{ background: '#1e1e1e', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}>
                  <img src={game.coverImage} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} />
                  <div style={{ padding: '10px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{game.name}</p>
                    <button onClick={() => handleAdd(game.externalId)} style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="full-grid">
            {vault.map(game => (
              <div 
                key={game.id} 
                className={`flip-card ${flippedCard === game.id ? 'flipped' : ''}`}
                onClick={() => setFlippedCard(flippedCard === game.id ? null : game.id)}
              >
                <div className="flip-card-inner">
                  {/* FRENTE: PORTADA LIMPIA */}
                  <div className="flip-card-front">
                    <img src={game.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{game.name}</p>
                    </div>
                  </div>

                  {/* ATRÁS: NOMBRE, AÑO Y TRAILER */}
                  <div className="flip-card-back">
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#fff', lineHeight: '1.2' }}>{game.name}</h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>{game.releaseYear}</p>
                      <p style={{ fontSize: '11px', color: '#bbb', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '5', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {game.description}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedVideo(game.youtubeVideoId); }}
                        style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }}
                      >
                        🎬 Trailer
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}
                        style={{ width: '100%', background: 'transparent', color: '#666', border: 'none', fontSize: '11px' }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav style={{ 
        position: 'fixed', bottom: 0, width: '100%', height: '80px', 
        backgroundColor: '#1c1c1e', borderTop: '1px solid #333', 
        display: 'flex', justifyContent: 'space-around', alignItems: 'center', 
        zIndex: 100 
      }}>
        <button onClick={() => setActiveTab('vault')} style={{ background: 'none', border: 'none', color: activeTab === 'vault' ? '#3b82f6' : '#888' }}>
          <div style={{ fontSize: '26px' }}>🗃️</div>
          <span style={{ fontSize: '11px' }}>Vault</span>
        </button>
        <button onClick={() => setActiveTab('search')} style={{ background: 'none', border: 'none', color: activeTab === 'search' ? '#3b82f6' : '#888' }}>
          <div style={{ fontSize: '26px' }}>🔍</div>
          <span style={{ fontSize: '11px' }}>Search</span>
        </button>
      </nav>

      {selectedVideo && <VideoModal videoId={selectedVideo} onClose={() => setSelectedVideo(null)} />}
    </div>
  );
}

export default App;