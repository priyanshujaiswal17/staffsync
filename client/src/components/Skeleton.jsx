import React from 'react';

export default function Skeleton({ type = 'line', count = 1, height = 20, className = '' }) {
  const items = Array.from({ length: count });

  if (type === 'card') {
    return (
      <div className={`card p-3 border-1 ${className}`}>
        <div className="placeholder-glow">
          <span className="placeholder col-4 mb-2 d-block" style={{ height: 14 }}></span>
          <span className="placeholder col-6 mb-2 d-block" style={{ height: 28 }}></span>
          <span className="placeholder col-8 d-block" style={{ height: 12 }}></span>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="table-responsive placeholder-glow p-3">
        <span className="placeholder col-12 mb-3 d-block" style={{ height: 36 }}></span>
        {items.map((_, i) => (
          <span key={i} className="placeholder col-12 mb-2 d-block" style={{ height: 32 }}></span>
        ))}
      </div>
    );
  }

  return (
    <div className={`placeholder-glow ${className}`}>
      {items.map((_, i) => (
        <span
          key={i}
          className="placeholder col-12 mb-2 rounded d-block"
          style={{ height }}
        ></span>
      ))}
    </div>
  );
}
