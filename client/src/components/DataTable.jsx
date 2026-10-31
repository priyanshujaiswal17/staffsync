import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function DataTable({
  columns,
  data = [],
  loading = false,
  error = null,
  onRetry,
  page = 1,
  pages = 1,
  total = 0,
  onPageChange,
  searchPlaceholder = 'Search...',
  searchTerm = '',
  onSearchChange,
  filterComponent,
  emptyTitle = 'No records found',
  emptyMessage = 'There are no items to display matching your criteria.',
  emptyActionLabel,
  onEmptyAction
}) {
  return (
    <div className="card shadow-sm border-1">
      {/* Search and Filters Bar */}
      {(onSearchChange || filterComponent) && (
        <div className="p-3 border-bottom d-flex flex-wrap gap-2 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 320 }}>
            {onSearchChange && (
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
          </div>
          {filterComponent && (
            <div className="d-flex align-items-center gap-2">
              {filterComponent}
            </div>
          )}
        </div>
      )}

      {/* Table Body / Loading / Error / Empty */}
      {loading ? (
        <Skeleton type="table" count={5} />
      ) : error ? (
        <div className="p-4 text-center">
          <div className="text-danger mb-2">
            <i className="bi bi-exclamation-triangle fs-3"></i>
          </div>
          <div className="text-danger fw-semibold mb-2">{error}</div>
          {onRetry && (
            <button className="btn btn-sm btn-outline-secondary" onClick={onRetry}>
              <i className="bi bi-arrow-clockwise me-1"></i> Retry
            </button>
          )}
        </div>
      ) : data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          message={emptyMessage}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      ) : (
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={col.align === 'right' ? 'text-end' : col.align === 'center' ? 'text-center' : ''}
                    style={{ width: col.width }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIdx) => (
                <tr key={row._id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`${col.align === 'right' ? 'text-end tabular-nums' : col.align === 'center' ? 'text-center' : ''} ${col.className || ''}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && !error && data.length > 0 && pages > 1 && (
        <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted small">
          <div>
            Showing <span className="fw-semibold text-dark">{data.length}</span> of{' '}
            <span className="fw-semibold text-dark">{total}</span> records
          </div>
          <div className="d-flex align-items-center gap-1">
            <button
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <span className="px-2">
              Page {page} of {pages}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary px-2 py-1"
              disabled={page >= pages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
