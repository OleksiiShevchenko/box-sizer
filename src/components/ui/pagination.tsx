import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  path?: string;
}

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  path = "/dashboard",
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  function pageHref(page: number): string {
    return page === 1 ? path : `${path}?page=${page}`;
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-slate-200 px-6 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
    >
      <p>
        Showing {startItem}-{endItem} of {totalCount} packing plans
      </p>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {currentPage > 1 ? (
          <Link
            href={pageHref(currentPage - 1)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-md px-2 py-1 text-xs font-medium text-slate-300">
            Previous
          </span>
        )}

        {pages.map((page) => (
          <Link
            key={page}
            href={pageHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors ${
              page === currentPage
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {page}
          </Link>
        ))}

        {currentPage < totalPages ? (
          <Link
            href={pageHref(currentPage + 1)}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md px-2 py-1 text-xs font-medium text-slate-300">Next</span>
        )}
      </div>
    </nav>
  );
}
