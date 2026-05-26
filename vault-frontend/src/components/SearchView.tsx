import { SearchInput } from './SearchInput';
import { AddButton } from './AddButton';

interface SearchResult {
  externalId: number;
  name: string;
  coverImage?: string;
}

interface SearchViewProps {
  query: string;
  results: SearchResult[];
  searching: boolean;
  viewMode: 'grid' | 'list';
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onAdd: (externalId: number) => void;
  onViewMode: (mode: 'grid' | 'list') => void;
  logo: React.ReactNode;
}

export function SearchView({
  query,
  results,
  searching,
  viewMode,
  onQueryChange,
  onClose,
  onAdd,
  onViewMode,
  logo,
}: SearchViewProps) {
  return (
    <div className="search-view">

      {/* ── Top Bar ── */}
      <div className="top-bar">
        {logo}
        <div className="top-bar-right">
          <div className="view-switch">
            <button
              className={`switch-pill ${viewMode === 'grid' ? 'active' : 'inactive'}`}
              onClick={() => onViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`switch-pill ${viewMode === 'list' ? 'active' : 'inactive'}`}
              onClick={() => onViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="search-view-body">

        {/* Search input (inline, no fixed) */}
        <SearchInput
          inline
          value={query}
          onChange={onQueryChange}
          onClose={onClose}
        />

        {/* Results list */}
        <div className="search-results-list">
          {searching && (
            <p className="hint-text">Buscando...</p>
          )}
          {!searching && query.trim() && results.length === 0 && (
            <p className="hint-text">No se encontraron juegos</p>
          )}
          {!query.trim() && !searching && (
            <p className="hint-text">Escribe para buscar juegos</p>
          )}
          {results.map(game => (
            <div key={game.externalId} className="search-result-row">
              {game.coverImage
                ? <img src={game.coverImage} className="search-result-thumb" alt={game.name} />
                : <div className="search-result-thumb search-result-thumb--empty" />
              }
              <p className="search-result-name">{game.name}</p>
              <AddButton onClick={() => onAdd(game.externalId)} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
