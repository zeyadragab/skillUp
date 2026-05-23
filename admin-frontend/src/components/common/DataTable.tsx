import React from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { _id: string }>({
  columns,
  data,
  loading,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-panel rounded-xl p-12">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-7 h-7 border-2 border-edge border-t-accent rounded-full animate-spin" />
          <p className="text-[13px] text-fg-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-panel rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] table-fixed">
          <thead className="bg-canvas border-b border-edge">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3 text-left text-[11px] font-semibold text-fg-3 uppercase tracking-widest ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <Inbox className="w-9 h-9 text-fg-3/30 mx-auto mb-3" />
                  <p className="text-[13px] text-fg-3">No data available</p>
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item._id}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-panel-hi transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-3.5 text-[13px] text-fg-2 ${column.className || ''}`}
                    >
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.pages > 1 && (
        <div className="px-5 py-3.5 border-t border-edge flex items-center justify-between">
          <p className="text-[12px] text-fg-3">
            {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1.5 rounded-lg border border-edge text-fg-3 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-panel-hi hover:text-fg-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-[12px] text-fg-3">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-1.5 rounded-lg border border-edge text-fg-3 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-panel-hi hover:text-fg-1 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
