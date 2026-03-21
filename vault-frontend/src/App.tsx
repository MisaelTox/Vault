import { useEffect, useState, useRef, useCallback } from 'react';
import { vaultApi } from './api/axios';
import { VideoModal } from './components/VideoModal';
import { LoginScreen } from './components/LoginScreen';
import type { Game, GameStatus } from './types/game';

const USER_COLORS: Record<string, string> = {
  Tox:    '#3b82f6',
  Jedis:  '#10b981',
  Chango: '#f59e0b',
};

const STATUS_OPTIONS: { label: GameStatus; color: string }[] = [
  { label: 'Pendiente',   color: '#6b7280' },
  { label: 'Jugando',     color: '#3b82f6' },
  { label: 'Jugado',      color: '#10b981' },
  { label: 'Abandonado',  color: '#ef4444' },
];

interface DragGhost {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  coverImage: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(
    localStorage.getItem('vault_user')
  );
  const [vault, setVault] = useState<Game[]>([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'vault'>('vault');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [flippedCard, setFlippedCard] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [dragGhost, setDragGhost] = useState<DragGhost | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string | null>(null);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedId = useRef<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const ghostRef = useRef<DragGhost | null>(null);

  useEffect(() => { if (currentUser) loadVault(); }, [currentUser, filterUser]);
  useEffect(() => { setEditMode(false); }, [activeTab]);

  useEffect(() => {
    const handlers: Array<{ el: HTMLDivElement; events: Array<{ name: string; fn: EventListener }> }> = [];

    vault.forEach(game => {
      const el = cardRefs.current.get(game.id);
      if (!el) return;

      const onTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartPos.current = { x: touch.clientX, y: touch.clientY };

        if (editMode) {
          const rect = el.getBoundingClientRect();
          const ghost: DragGhost = {
            id: game.id,
            x: touch.clientX - rect.width / 2,
            y: touch.clientY - rect.height / 2,
            width: rect.width,
            height: rect.height,
            coverImage: game.coverImage,
          };
          draggedId.current = game.id;
          ghostRef.current = ghost;
          setDragGhost(ghost);
          if (navigator.vibrate) navigator.vibrate(30);
        } else {
          longPressTimer.current = setTimeout(() => {
            setEditMode(true);
            setFlippedCard(null);
            if (navigator.vibrate) navigator.vibrate(40);
          }, 500);
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];

        if (editMode && draggedId.current && ghostRef.current) {
          const rect = cardRefs.current.get(draggedId.current)?.getBoundingClientRect();
          const w = rect?.width ?? ghostRef.current.width;
          const h = rect?.height ?? ghostRef.current.height;
          const updated = {
            ...ghostRef.current,
            x: touch.clientX - w / 2,
            y: touch.clientY - h / 2,
          };
          ghostRef.current = updated;
          setDragGhost({ ...updated });

          const els = Array.from(cardRefs.current.entries());
          for (const [id, cardEl] of els) {
            if (id === draggedId.current) continue;
            const r = cardEl.getBoundingClientRect();
            if (
              touch.clientX >= r.left && touch.clientX <= r.right &&
              touch.clientY >= r.top && touch.clientY <= r.bottom
            ) {
              setDragOverId(id);
              break;
            }
          }
        } else if (!editMode && touchStartPos.current) {
          const dx = Math.abs(touch.clientX - touchStartPos.current.x);
          const dy = Math.abs(touch.clientY - touchStartPos.current.y);
          if (dx > 10 || dy > 10) {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
          }
        }
      };

      const onTouchEnd = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);

        if (draggedId.current && dragOverId) {
          setVault(prev => {
            const newVault = [...prev];
            const fromIndex = newVault.findIndex(g => g.id === draggedId.current);
            const toIndex = newVault.findIndex(g => g.id === dragOverId);
            const [moved] = newVault.splice(fromIndex, 1);
            newVault.splice(toIndex, 0, moved);
            return newVault;
          });
        }

        draggedId.current = null;
        ghostRef.current = null;
        setDragGhost(null);
        setDragOverId(null);
        touchStartPos.current = null;
      };

      el.addEventListener('touchstart', onTouchStart as EventListener, { passive: false });
      el.addEventListener('touchmove', onTouchMove as EventListener, { passive: false });
      el.addEventListener('touchend', onTouchEnd as EventListener);

      handlers.push({
        el,
        events: [
          { name: 'touchstart', fn: onTouchStart as EventListener },
          { name: 'touchmove', fn: onTouchMove as EventListener },
          { name: 'touchend', fn: onTouchEnd as EventListener },
        ]
      });
    });

    return () => {
      handlers.forEach(({ el, events }) => {
        events.forEach(({ name, fn }) => el.removeEventListener(name, fn));
      });
    };
  }, [vault, editMode, dragOverId]);

  const loadVault = async () => {
    try {
      const res = await vaultApi.getVault(filterUser ?? undefined);
      setVault(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = async () => {
    if (!search) return;
    setShowSuggestions(false);
    try {
      const res = await vaultApi.searchGames(search);
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearchInput = useCallback((value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) { setSuggestions([]); setShowSuggestions(false); return; }
    setSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await vaultApi.searchGames(value);
        setSuggestions(res.data.slice(0, 6));
        setShowSuggestions(true);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 350);
  }, []);

  const handleSelectSuggestion = (game: any) => {
    setSearch(game.name);
    setSearchResults([game]);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleAdd = async (id: number) => {
    if (!currentUser) return;
    try {
      await vaultApi.addToVault(id, currentUser);
      setActiveTab('vault');
      loadVault();
    } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: GameStatus) => {
    try {
      await vaultApi.updateStatus(id, status);
      setVault(prev => prev.map(g => g.id === id ? { ...g, status } : g));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    try {
      await vaultApi.deleteGame(id);
      loadVault();
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('vault_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  const userColor = USER_COLORS[currentUser] ?? '#888';
  const allUsers = Object.keys(USER_COLORS);

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
          padding-bottom: 100px;
          width: 100%;
          box-sizing: border-box;
        }

        .flip-card {
          background-color: transparent;
          aspect-ratio: 2 / 3;
          perspective: 1000px;
          width: 100%;
          position: relative;
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          user-select: none;
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
          padding: 10px; border: 1px solid #3b82f6;
          box-sizing: border-box; text-align: left;
          overflow: hidden;
        }

        @keyframes wiggle {
          0%   { transform: rotate(0deg) scale(1); }
          25%  { transform: rotate(-2deg) scale(1.02); }
          75%  { transform: rotate(2deg) scale(1.02); }
          100% { transform: rotate(0deg) scale(1); }
        }
        .flip-card.wiggle {
          animation: wiggle 0.3s infinite ease-in-out;
        }
        .flip-card.wiggle.dragging-source {
          opacity: 0.3;
          animation: none;
        }
        .flip-card.drag-over {
          outline: 2px dashed #3b82f6;
          border-radius: 12px;
          opacity: 0.5;
        }

        .delete-btn {
          position: absolute;
          top: -8px; left: -8px;
          width: 26px; height: 26px;
          background: #ff3b30;
          border: 2px solid white;
          border-radius: 50%;
          color: white;
          font-size: 14px; font-weight: bold;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 10;
          line-height: 1; padding: 0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }

        .done-btn {
          background: #3b82f6; color: white;
          border: none; border-radius: 20px;
          padding: 6px 18px; font-weight: bold;
          font-size: 14px; cursor: pointer;
        }

        .drag-ghost {
          position: fixed;
          pointer-events: none;
          z-index: 999;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          transform: scale(1.08) rotate(3deg);
          opacity: 0.95;
          transition: none;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #333;
          background: #1e1e1e;
          color: #aaa;
          font-size: 13px;
          cursor: pointer;
          min-height: 36px;
        }
        .filter-btn.active {
          border-color: currentColor;
          font-weight: bold;
        }

        img { -webkit-touch-callout: none; pointer-events: none; }
      `}</style>

      {dragGhost && (
        <div
          className="drag-ghost"
          style={{
            left: dragGhost.x,
            top: dragGhost.y,
            width: dragGhost.width,
            height: dragGhost.height,
          }}
        >
          <img src={dragGhost.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      <header style={{ padding: '25px 20px 10px 20px', width: '100%', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '800' }}>
          {activeTab === 'vault' ? 'My Vault' : 'Discovery'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {editMode && (
            <button className="done-btn" onClick={() => setEditMode(false)}>Done</button>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: userColor, fontWeight: 'bold', padding: 0,
            }}
          >
            {currentUser}
          </button>
        </div>
      </header>

      {editMode && (
        <p style={{ margin: '0 0 0 20px', fontSize: '12px', color: '#888' }}>
          Hold & drag to reorder · Tap ✕ to remove
        </p>
      )}

      {/* Filtros por usuario (solo en vault) */}
      {activeTab === 'vault' && !editMode && (
        <div style={{ display: 'flex', gap: '8px', padding: '0 15px 10px', overflowX: 'auto' }}>
          <button
            className={`filter-btn ${filterUser === null ? 'active' : ''}`}
            style={{ color: filterUser === null ? 'white' : undefined, borderColor: filterUser === null ? 'white' : undefined }}
            onClick={() => setFilterUser(null)}
          >
            Todos
          </button>
          {allUsers.map(u => (
            <button
              key={u}
              className={`filter-btn ${filterUser === u ? 'active' : ''}`}
              style={{ color: filterUser === u ? USER_COLORS[u] : undefined, borderColor: filterUser === u ? USER_COLORS[u] : undefined }}
              onClick={() => setFilterUser(prev => prev === u ? null : u)}
            >
              {u}
            </button>
          ))}
        </div>
      )}

      <main style={{ flex: 1, width: '100%' }}>
        {activeTab === 'search' ? (
          <>
            <div style={{ padding: '15px', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Search games..."
                  value={search}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#222', color: 'white', fontSize: '16px' }}
                />
                <button onClick={handleSearch} style={{ padding: '0 20px', borderRadius: '12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', fontWeight: 'bold' }}>
                  {searching ? '…' : 'Go'}
                </button>
              </div>

              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: '15px', right: '15px',
                  background: '#1e1e1e', border: '1px solid #333', borderRadius: '12px',
                  zIndex: 50, overflow: 'hidden', marginTop: '-4px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                }}>
                  {suggestions.map((game, i) => (
                    <div
                      key={game.externalId}
                      onMouseDown={() => handleSelectSuggestion(game)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        borderTop: i > 0 ? '1px solid #2a2a2a' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <img src={game.coverImage} style={{ width: '32px', height: '44px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0 }} />
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: 'white' }}>{game.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{game.releaseYear}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                ref={(el) => { if (el) cardRefs.current.set(game.id, el); }}
                className={`flip-card
                  ${!editMode && flippedCard === game.id ? 'flipped' : ''}
                  ${editMode ? 'wiggle' : ''}
                  ${dragOverId === game.id ? 'drag-over' : ''}
                  ${draggedId.current === game.id ? 'dragging-source' : ''}
                `}
                onClick={() => {
                  if (!editMode) setFlippedCard(flippedCard === game.id ? null : game.id);
                }}
                style={{ cursor: editMode ? 'grab' : 'pointer' }}
              >
                {editMode && (
                  <button
                    className="delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}
                  >
                    ✕
                  </button>
                )}

                <div className="flip-card-inner">
                  <div className="flip-card-front">
                    <img src={game.coverImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Badge de status */}
                    {game.status && (
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: STATUS_OPTIONS.find(s => s.label === game.status)?.color ?? '#6b7280',
                        color: 'white', fontSize: '9px', fontWeight: 'bold',
                        padding: '3px 6px', borderRadius: '6px',
                        letterSpacing: '0.3px', textTransform: 'uppercase',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                      }}>
                        {game.status}
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.95))' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{game.name}</p>
                      {/* Tag de quién lo agregó */}
                      <span style={{
                        fontSize: '9px', fontWeight: 'bold',
                        color: USER_COLORS[game.addedBy] ?? '#888',
                        background: `${USER_COLORS[game.addedBy] ?? '#888'}22`,
                        border: `1px solid ${USER_COLORS[game.addedBy] ?? '#888'}66`,
                        padding: '2px 6px', borderRadius: '5px',
                        display: 'inline-block', marginTop: '4px',
                      }}>
                        {game.addedBy}
                      </span>
                    </div>
                  </div>

                  <div className="flip-card-back">
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#fff', lineHeight: '1.2' }}>{game.name}</h4>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>{game.releaseYear}</p>
                      <p style={{ margin: '0 0 6px 0', fontSize: '10px', fontWeight: 'bold', color: USER_COLORS[game.addedBy] ?? '#888' }}>
                        + {game.addedBy}
                      </p>
                      <p style={{ fontSize: '10px', color: '#bbb', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0 }}>
                        {game.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedVideo(game.youtubeVideoId); }}
                        style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11px' }}
                      >
                        🎬 Trailer
                      </button>
                      {/* Botones de status */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.label}
                            onClick={(e) => { e.stopPropagation(); handleStatusChange(game.id, opt.label); }}
                            style={{
                              padding: '6px 2px',
                              borderRadius: '8px',
                              border: `1px solid ${game.status === opt.label ? opt.color : '#333'}`,
                              background: game.status === opt.label ? opt.color : 'transparent',
                              color: game.status === opt.label ? 'white' : '#888',
                              fontSize: '10px',
                              fontWeight: game.status === opt.label ? 'bold' : 'normal',
                              cursor: 'pointer',
                              minHeight: '28px',
                            }}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav style={{
        position: 'fixed', bottom: 0, width: '100%',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backgroundColor: '#1c1c1e', borderTop: '1px solid #333',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        zIndex: 100, height: 'calc(80px + env(safe-area-inset-bottom))',
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
