import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition-colors hover:text-gray-900">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-medium text-gray-900" : ""}>{item.label}</span>
            )}
            {!isLast ? <span className="text-gray-300">/</span> : null}
          </span>
        );
      })}
    </nav>
  );
}
