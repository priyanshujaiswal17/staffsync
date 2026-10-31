import React from 'react';

export default function EmptyState({ icon = 'bi-inbox', title, message, actionLabel, onAction }) {
  return (
    <div className="text-center py-5 px-3">
      <div className="d-inline-flex align-items-center justify-content-center bg-light text-secondary rounded-circle mb-3" style={{ width: 56, height: 56 }}>
        <i className={`bi ${icon} fs-3`}></i>
      </div>
      <h6 className="fw-semibold text-dark mb-1">{title}</h6>
      <p className="text-muted small mb-3 mx-auto" style={{ maxWidth: 360 }}>{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-sm btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
