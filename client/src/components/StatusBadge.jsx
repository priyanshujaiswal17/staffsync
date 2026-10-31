import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = String(status).toLowerCase();

  let bgClass = 'bg-light text-dark';
  let dotColor = '#94A3B8';

  if (['present', 'approved', 'active', 'completed'].includes(normalized)) {
    bgClass = 'bg-success-subtle text-success border border-success-subtle';
    dotColor = '#10B981';
  } else if (['late', 'pending', 'enrolled'].includes(normalized)) {
    bgClass = 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    dotColor = '#F59E0B';
  } else if (['absent', 'rejected', 'inactive', 'terminated'].includes(normalized)) {
    bgClass = 'bg-danger-subtle text-danger border border-danger-subtle';
    dotColor = '#EF4444';
  } else if (['on leave', 'unpaid'].includes(normalized)) {
    bgClass = 'bg-primary-subtle text-primary border border-primary-subtle';
    dotColor = '#4F46E5';
  }

  return (
    <span className={`badge rounded-pill px-2.5 py-1.5 fw-medium d-inline-flex align-items-center gap-1.5 ${bgClass}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dotColor }}></span>
      {status}
    </span>
  );
}
