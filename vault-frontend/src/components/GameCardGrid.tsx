import type { Game } from '../types/game';
import { UserButton } from './UserButton';

const USER_COLORS: Record<string, string> = {
  Chango: '#003087',
  Tox:    '#00B63A',
  Jedis:  '#FC3D41',
};

interface GameCardGridProps {
  game: Game;
  isFlipped: boolean;
  onFlip: () => void;
  onTrailer: (videoId: string) => void;
}

export function GameCardGrid({ game, isFlipped, onFlip, onTrailer }: GameCardGridProps) {
  return (
    <div
      className={`card-flip${isFlipped ? ' flipped' : ''}`}
      onClick={onFlip}
    >
      <div className="card-flip-inner">

        {/* ── Variant A: Front — cover image + title ── */}
        <div className="card-a">
          <img src={game.coverImage} alt={game.name} />
          <div className="card-a-gradient">
            <p className="card-a-title">{game.name}</p>
          </div>
        </div>

        {/* ── Variant B: Back — synopsis + meta + actions ── */}
        <div className="card-b">
          <p className="card-b-title">{game.name}</p>
          <p className="card-b-desc">{game.description}</p>
          <div className="card-b-meta">
            <span className="year-chip">{game.releaseYear}</span>
            <UserButton
              user={game.addedBy}
              color={USER_COLORS[game.addedBy] ?? '#6E6E6E'}
              reduced
            />
            {game.youtubeVideoId && (
              <button
                className="trailer-btn"
                onClick={(e) => { e.stopPropagation(); onTrailer(game.youtubeVideoId!); }}
              >
                Trailer
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
