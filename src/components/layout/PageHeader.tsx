import { Fragment } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  badge,
  badgeColor,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumbs && (
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          {breadcrumbs.map((crumb, i) => (
            <Fragment key={i}>
              {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gray-700 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {badge && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  badgeColor || "bg-gray-100 text-gray-600"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
