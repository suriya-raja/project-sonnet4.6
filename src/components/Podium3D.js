'use client';

export default function Podium3D({ topThree }) {
  if (!topThree || topThree.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏆</div>
        <p className="empty-state-text">No donors yet. Be the first to donate!</p>
      </div>
    );
  }

  // Reorder: [2nd, 1st, 3rd] for visual podium layout
  const ordered = [];
  if (topThree[1]) ordered.push({ ...topThree[1], position: 'second' });
  if (topThree[0]) ordered.push({ ...topThree[0], position: 'first' });
  if (topThree[2]) ordered.push({ ...topThree[2], position: 'third' });

  const medals = { first: '🥇', second: '🥈', third: '🥉' };
  const avatarClasses = { first: 'gold', second: 'silver', third: 'bronze' };

  return (
    <div className="scoreboard-container">
      <div className="podium-container">
        {ordered.map((donor, idx) => (
          <div
            key={donor.id || idx}
            className="podium-item"
            style={{ animationDelay: `${idx * 0.15}s` }}
          >
            <div className={`podium-avatar ${avatarClasses[donor.position]}`}>
              {donor.name?.charAt(0)?.toUpperCase() || '?'}
              <span className="podium-medal">{medals[donor.position]}</span>
            </div>
            <div className="podium-name">{donor.name}</div>
            <div className="podium-score">⭐ {donor.score} pts</div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}>
              {donor.donation_count} donation{donor.donation_count !== 1 ? 's' : ''}
            </div>
            {donor.is_ngo && (
              <span className="food-card-badge badge-ngo" style={{ marginTop: '6px' }}>
                🏢 NGO
              </span>
            )}
            <div className={`podium-base ${donor.position}`}>
              {donor.position === 'first' ? '1' : donor.position === 'second' ? '2' : '3'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
