import React from 'react';

const PaginationBar = ({
  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0,
  onPageChange,
  onSizeChange,
  sizeOptions = [5, 8, 10, 25]
}) => {
  const safeTotalPages = Math.max(totalPages || 0, totalElements === 0 ? 0 : 1);
  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 px-5 py-3">
      <p className="text-sm text-[#1a3d42]/50">
        Showing {from}–{to} of {totalElements}
      </p>
      <div className="flex items-center gap-2">
        {onSizeChange && (
          <select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm text-[#1a3d42]"
          >
            {sizeOptions.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(Math.max(0, page - 1))}
          className="rounded-md border border-black/10 px-3 py-2 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm text-[#1a3d42]/55">
          {safeTotalPages === 0 ? 0 : page + 1} / {safeTotalPages}
        </span>
        <button
          type="button"
          disabled={page + 1 >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border border-black/10 px-3 py-2 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PaginationBar;
