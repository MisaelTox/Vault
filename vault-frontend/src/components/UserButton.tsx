interface UserButtonProps {
  user: string;
  color: string;
  reduced?: boolean;
  onClick?: () => void;
}

export function UserButton({ user, color, reduced = false, onClick }: UserButtonProps) {
  if (reduced) {
    return (
      <span
        className="user-tag-reduced"
        style={{ background: color }}
        title={user}
      >
        {user[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      className="user-tag"
      style={{ background: color }}
      onClick={onClick}
    >
      {user}
    </span>
  );
}
