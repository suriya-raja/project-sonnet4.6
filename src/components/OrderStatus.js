'use client';

export default function OrderStatus({ status, onUpdateStatus, isDonor }) {
  const steps = [
    { key: 'accepted', label: '✅ Accepted' },
    { key: 'delivering', label: '🚗 Delivering' },
    { key: 'completed', label: '🎉 Completed' },
  ];

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div>
      <div className="status-pipeline">
        {steps.map((step, idx) => (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className={`status-step ${
                idx < currentIndex ? 'completed' :
                idx === currentIndex ? 'active' : ''
              }`}
            >
              {step.label}
            </div>
            {idx < steps.length - 1 && (
              <div className={`status-connector ${idx < currentIndex ? 'active' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {isDonor && status !== 'completed' && (
        <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 'var(--space-sm)' }}>
          {status === 'accepted' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onUpdateStatus?.('delivering')}
            >
              🚗 Mark as Delivering
            </button>
          )}
          {status === 'delivering' && (
            <button
              className="btn btn-amber btn-sm"
              onClick={() => onUpdateStatus?.('completed')}
            >
              🎉 Mark as Completed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
