import { useEffect, useState, useRef, useCallback } from 'react';
import { vaultApi } from './api/axios';
import { VideoModal } from './components/VideoModal';
import { LoginScreen } from './components/LoginScreen';
import { UserButton } from './components/UserButton';
import { GameCardGrid } from './components/GameCardGrid';
import { FAB } from './components/FAB';
import { SearchView } from './components/SearchView';
import type { Game, GameStatus } from './types/game';

const USER_COLORS: Record<string, string> = {
  Chango: '#003087',
  Tox:    '#00B63A',
  Jedis:  '#FC3D41',
};

const STATUS_COLORS: Partial<Record<GameStatus, string>> = {
  Pendiente:  '#6E6E6E',
  Jugando:    '#2C61FF',
  Jugado:     '#00B63A',
  Abandonado: '#FC3D41',
};

const STATUS_OPTIONS: GameStatus[] = ['Pendiente', 'Jugando', 'Jugado', 'Abandonado'];

function VaultLogo({ width = 55, height = 48 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 55 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* White 50% stroke shape — glow effect */}
      <path d="M27.5 0C35.8769 0 43.2037 4.33454 47.4619 10.8398C49.1314 10.9365 50.7479 11.5526 52.0684 12.6338C53.9239 14.1532 54.9999 16.425 55 18.8232V20.4111C55 21.7018 54.6913 22.9196 54.1484 23.999C54.6945 25.0851 55 26.3067 55 27.5889V29.1768C54.9999 31.575 53.9239 33.8468 52.0684 35.3662C50.7485 36.4468 49.1326 37.0621 47.4639 37.1592C43.2051 43.6654 35.8768 48 27.5 48C19.1232 48 11.7949 43.6654 7.53613 37.1592C5.86742 37.0621 4.25154 36.4468 2.93164 35.3662C1.07607 33.8468 0.000110671 31.575 0 29.1768V27.5889C0 26.307 0.305784 25.0858 0.851562 24C0.305783 22.9142 0 21.693 0 20.4111V18.8232C0.000111526 16.425 1.07607 14.1532 2.93164 12.6338C4.2521 11.5526 5.86857 10.9365 7.53809 10.8398C11.7963 4.33454 19.1231 0 27.5 0ZM27.5 8C20.2288 8 14.0882 12.9456 12.208 19.6709L8 18.8232V20.4111L17.9268 22.3906V25.6104L8 27.5889V29.1768L12.2061 28.3291C14.0862 35.0544 20.2288 40 27.5 40C34.7712 40 40.9138 35.0544 42.7939 28.3291L47 29.1768V27.5889L37.0732 25.6094V22.3896L47 20.4102V18.8232L42.792 19.6709C40.9706 13.1559 35.151 8.31127 28.1787 8.01465L27.5 8ZM27.8887 14.4678C31.8813 14.6309 35.2417 17.296 36.4707 20.9434L29.5527 22.3379V25.6621L36.4727 27.0566C35.2039 30.8216 31.6621 33.54 27.5 33.54C23.3379 33.54 19.7947 30.8231 18.5273 27.0566L25.4473 25.6621V22.3379L18.5293 20.9434C19.7966 17.1782 23.3378 14.46 27.5 14.46L27.8887 14.4678Z" fill="white" fillOpacity="0.5"/>
      {/* Almost Black logo shape */}
      <path d="M47 20.4113V18.8236L42.7921 19.6706C40.9119 12.9453 34.7712 8 27.5 8C20.2288 8 14.088 12.9453 12.2079 19.6706L8 18.8236V20.4113L17.9268 22.3908V25.6106L8 27.5887V29.1764L12.2065 28.3294C14.0866 35.0547 20.2288 40 27.5 40C34.7712 40 40.9134 35.0547 42.7935 28.3294L47 29.1764V27.5887L37.0732 25.6092V22.3894L47 20.4098V20.4113ZM27.5 33.5403C23.3377 33.5403 19.7941 30.8229 18.5269 27.0562L25.4474 25.6623V22.3377L18.5297 20.9438C19.7969 17.1785 23.3377 14.4597 27.5 14.4597C31.6623 14.4597 35.2016 17.1785 36.4703 20.9438L29.5526 22.3377V25.6623L36.4731 27.0562C35.2045 30.8215 31.6623 33.5403 27.5 33.5403Z" fill="#1B1B1B"/>
    </svg>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(
    localStorage.getItem('vault_user')
  );
  const [vault, setVault] = useState<Game[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (currentUser) loadVault(); }, [currentUser]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [searchOpen]);

  const loadVault = async () => {
    try {
      const res = await vaultApi.getVault();
      setVault(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSearchInput = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!value.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await vaultApi.searchGames(value);
        setSearchResults(res.data);
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 350);
  }, []);

  const handleAdd = async (externalId: number) => {
    if (!currentUser) return;
    try {
      await vaultApi.addToVault(externalId, currentUser);
      setSearchOpen(false);
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
      setVault(prev => prev.filter(g => g.id !== id));
      if (expandedCard === id) setExpandedCard(null);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    localStorage.removeItem('vault_user');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} />;
  }

  return (
    <div className="app-root">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body, #root {
          margin: 0; padding: 0; width: 100%;
          background: #F2F2F2;
          font-family: 'Selecta', system-ui, -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        img { -webkit-touch-callout: none; pointer-events: none; user-select: none; }

        .app-root {
          background: #F2F2F2;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ── TOP BAR ── */
        .top-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px;
          height: 48px;
          background: transparent;
          pointer-events: none;
        }
        .top-bar > * { pointer-events: all; }
        .top-bar-right {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.5);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border-radius: 8px;
          padding: 8px;
        }

/* ── ICON BUTTONS ── */
        .icon-btn {
          width: 40px; height: 40px;
          background: #1B1B1B; border: none; border-radius: 2px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: border-radius 0.15s; flex-shrink: 0;
        }
        .icon-btn:hover { border-radius: 8px; }

        /* ── GRID / LIST SWITCH ── */
        .view-switch {
          display: flex; align-items: center;
          background: #1B1B1B; border-radius: 2px;
          padding: 8px; height: 40px; width: 112px;
          transition: border-radius 0.15s;
        }
        .view-switch:hover { border-radius: 8px; }
        .switch-pill {
          height: 24px; width: 44px; border-radius: 12px; border: none;
          font-size: 12px; font-weight: 600; line-height: 17.5px;
          cursor: pointer; transition: all 0.15s; padding: 0;
        }
        .switch-pill.active  { background: #FFFFFF; color: #1B1B1B; }
        .switch-pill.inactive { background: transparent; color: #6E6E6E; }
        .switch-pill.inactive:hover { background: #3F3F3F; color: #FFFFFF; }


/* ── LIST VIEW ── */
        .vault-list {
          display: flex; flex-direction: column;
          gap: 8px; padding: 56px 8px 100px;
        }
        .card-list { border-radius: 8px; overflow: hidden; }
        .card-list-compact {
          height: 88px;
          display: flex; align-items: center;
          gap: 16px; padding: 0 16px;
          background: white; cursor: pointer;
        }
        .card-list-thumb {
          width: 56px; height: 56px;
          border-radius: 8px; object-fit: cover; flex-shrink: 0;
        }
        .card-list-title {
          flex: 1;
          font-size: 16px; font-weight: 600; color: #1B1B1B;
          line-height: 20px; margin: 0;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .expand-icon {
          width: 24px; height: 24px;
          display: flex; align-items: center; justify-content: center;
          color: #1B1B1B; flex-shrink: 0;
          font-size: 20px; font-weight: 300;
          transition: color 0.15s; cursor: pointer;
          border: none; background: none; padding: 0;
        }
        .expand-icon:hover { color: #2C61FF; }

        .card-list-expanded {
          background: #F2F2F2;
          padding: 16px;
          display: flex; gap: 16px; align-items: flex-start;
        }
        .card-list-expanded-content { flex: 1; min-width: 0; }
        .card-list-expanded-title {
          font-size: 16px; font-weight: 600; color: #1B1B1B;
          margin: 0 0 8px 0; line-height: 20px;
        }
        .card-list-expanded-desc {
          font-size: 12px; color: #6E6E6E; line-height: 17.5px;
          margin: 0 0 10px 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-list-meta {
          display: flex; align-items: center;
          gap: 6px; flex-wrap: wrap; margin-bottom: 10px;
        }
/* Status row in expanded card */
        .status-row {
          display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;
        }
        .status-chip {
          font-size: 10px; font-weight: 700; color: white;
          padding: 2px 8px; border-radius: 2px;
          cursor: pointer; border: none; opacity: 0.4;
          transition: opacity 0.15s, border-radius 0.15s;
          text-transform: uppercase; letter-spacing: 0.3px;
        }
        .status-chip.active { opacity: 1; }
        .status-chip:hover { border-radius: 12px; opacity: 1; }

        /* Delete button */
        .delete-btn-list {
          background: none; border: none; color: #BCBCBC;
          font-size: 18px; cursor: pointer; padding: 0;
          line-height: 1; transition: color 0.15s;
          margin-top: 4px;
        }
        .delete-btn-list:hover { color: #FC3D41; }

        /* ── SEARCH RESULTS ── */
        .search-results {
          padding: 56px 8px 16px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .search-result-item {
          background: white; border-radius: 8px;
          height: 88px;
          display: flex; align-items: center;
          gap: 16px; padding: 0 16px;
        }
        .search-result-thumb {
          width: 56px; height: 56px;
          border-radius: 8px; object-fit: cover;
          flex-shrink: 0; background: #F2F2F2;
        }
        .search-result-name {
          flex: 1;
          font-size: 16px; font-weight: 600; color: #1B1B1B;
          margin: 0; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
        }
/* ── EMPTY / LOADING ── */
        .hint-text {
          text-align: center; color: #6E6E6E;
          font-size: 14px; margin: 32px 0; line-height: 20px;
        }

        /* ── USER BUTTON (logout) ── */
        .user-logout-btn {
          background: none; border: none; cursor: pointer;
          padding: 0; transition: opacity 0.15s; flex-shrink: 0;
        }
        .user-logout-btn:hover { opacity: 0.7; }

        /* ── FOOTER WORDMARK ── */
        .vault-footer {
          padding: 24px 16px 40px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0;
          pointer-events: none;
          user-select: none;
        }
        .vault-wordmark {
          width: 100%;
          max-width: 340px;
          height: auto;
          display: block;
        }
        .vault-copyright {
          font-family: 'Selecta', sans-serif;
          font-size: 12px;
          font-weight: 400;
          color: #6E6E6E;
          margin: 8px 0 0 0;
          writing-mode: horizontal-tb;
        }
      `}</style>

      {/* ── SEARCH VIEW or MAIN CONTENT ── */}
      {searchOpen ? (
        <SearchView
          query={searchQuery}
          results={searchResults}
          searching={searching}
          viewMode={viewMode}
          onQueryChange={handleSearchInput}
          onClose={() => setSearchOpen(false)}
          onAdd={handleAdd}
          onViewMode={setViewMode}
          logo={
            <button className="user-logout-btn" onClick={handleLogout} title="Logout">
              <VaultLogo width={44} height={38} />
            </button>
          }
        />
      ) : (
        <>
          {/* ── Header (fixed) ── */}
          <div className="top-bar">
            <button className="user-logout-btn" onClick={handleLogout} title="Logout">
              <VaultLogo width={44} height={38} />
            </button>
            <div className="top-bar-right">
              <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="2"/>
                  <path d="M20 20l-3.5-3.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div className="view-switch">
                <button
                  className={`switch-pill ${viewMode === 'grid' ? 'active' : 'inactive'}`}
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </button>
                <button
                  className={`switch-pill ${viewMode === 'list' ? 'active' : 'inactive'}`}
                  onClick={() => setViewMode('list')}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {/*
            ── .cards-container (position: relative) ──
            Contains the grid/list + the .fab-sticky-rail overlay.
            The rail is absolute inset:0 so it spans exactly the grid height.
            The FAB inside is sticky — floats at bottom:32px throughout the
            entire card scroll, stops when the container ends → footer is clean.
          */}
          <main className="cards-container">

            {/* Grid view */}
            {viewMode === 'grid' && (
              <div className="vault-grid">
                <div className="info-card">
                  <span>Vault is a curated video game archive by @toxcatl, @mrchango, and @jedistg, featuring the games we've found interesting, played and yet to play.</span>
                </div>
                {vault.map(game => (
                  <GameCardGrid
                    key={game.id}
                    game={game}
                    isFlipped={expandedCard === game.id}
                    onFlip={() => setExpandedCard(expandedCard === game.id ? null : game.id)}
                    onTrailer={(id) => setSelectedVideo(id)}
                  />
                ))}
              </div>
            )}

            {/* List view */}
            {viewMode === 'list' && (
              <div className="vault-list">
                <div className="info-card-list">
                  Vault is a curated video game archive by @toxcatl, @mrchango, and @jedistg, featuring the games we've found interesting, played and yet to play.
                </div>
                {vault.map(game => {
                  const isExpanded = expandedCard === game.id;
                  return (
                    <div key={game.id} className="card-list">
                      <div
                        className="card-list-compact"
                        onClick={() => setExpandedCard(isExpanded ? null : game.id)}
                      >
                        <img src={game.coverImage} className="card-list-thumb" alt={game.name} />
                        <p className="card-list-title">{game.name}</p>
                        <button
                          className="expand-icon"
                          onClick={(e) => { e.stopPropagation(); setExpandedCard(isExpanded ? null : game.id); }}
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      </div>
                      {isExpanded && (
                        <div className="card-list-expanded">
                          <img src={game.coverImage} className="card-list-thumb" alt={game.name} />
                          <div className="card-list-expanded-content">
                            <p className="card-list-expanded-title">{game.name}</p>
                            <p className="card-list-expanded-desc">{game.description}</p>
                            <div className="card-list-meta">
                              <span className="year-chip">{game.releaseYear}</span>
                              <UserButton
                                user={game.addedBy}
                                color={USER_COLORS[game.addedBy] ?? '#6E6E6E'}
                              />
                              <button
                                className="trailer-btn"
                                onClick={() => setSelectedVideo(game.youtubeVideoId)}
                              >
                                Trailer
                              </button>
                            </div>
                            <div className="status-row">
                              {STATUS_OPTIONS.map(s => (
                                <button
                                  key={s}
                                  className={`status-chip ${game.status === s ? 'active' : ''}`}
                                  style={{ background: STATUS_COLORS[s] ?? '#6E6E6E' }}
                                  onClick={() => handleStatusChange(game.id, s)}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button
                            className="delete-btn-list"
                            onClick={() => handleDelete(game.id)}
                            title="Eliminar"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {vault.length === 0 && (
                  <p className="hint-text">El vault está vacío.<br />Toca + para agregar juegos.</p>
                )}
              </div>
            )}

          </main>{/* /.cards-container */}

          {/* FAB — fixed, always visible over cards */}
          <FAB onClick={() => setSearchOpen(true)} />

          {/* Footer — OUTSIDE .cards-container, FAB never overlaps it */}
          <footer className="vault-footer">
            <img src="/logo-vault.svg" alt="VAULT" className="vault-wordmark" />
            <div className="vault-footer-meta">
              <span className="vault-copyright-symbol">©</span>
              <span className="vault-copyright-year">2026</span>
            </div>
          </footer>
        </>
      )}

      {selectedVideo && (
        <VideoModal videoId={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  );
}

export default App;
