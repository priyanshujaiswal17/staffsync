import React from 'react';

export default function StatCard({ label, value, caption, icon, delta, deltaType = 'neutral' }) {
  let deltaClass = 'text-muted';
  if (deltaType === 'positive') deltaClass = 'text-success';
  if (deltaType === 'negative') deltaClass = 'text-danger';

  return (
    <div className="card h-100 p-3 shadow-sm border-1">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="text-secondary small fw-medium text-uppercase tracking-wider">{label}</span>
        {icon && (
          <div className="p-2 bg-light rounded text-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <i className={`bi ${icon} fs-5`}></i>
          </div>
        )}
      </div>
      <div className="fs-3 fw-bold text-dark tabular-nums mb-1">{value}</div>
      {(caption || delta) && (
        <div className="small d-flex align-items-center gap-1">
          {delta && <span className={`fw-semibold ${deltaClass}`}>{delta}</span>}
          {caption && <span className="text-muted">{caption}</span>}
        </div>
      )}
    </div>
  );
}
