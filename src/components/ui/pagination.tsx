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

  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  function pageHref(page: number): string {
    return page === 1 ? path : `${path}?page=${page}`;
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={pageHref(currentPage - 1)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
          Previous
        </span>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm transition-colors ${
            page === currentPage
              ? "bg-blue-600 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(currentPage + 1)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-400">
          Next
        </span>
      )}
    </nav>
  );
}
