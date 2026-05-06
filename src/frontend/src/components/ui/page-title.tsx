import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageTitleProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  className?: string;
  action?: React.ReactNode;
}

export function PageTitle({
  title,
  subtitle,
  breadcrumbs,
  className,
  action,
}: PageTitleProps) {
  return (
    <div className={cn("mb-6 pb-4 border-b-2 border-primary/20", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1 text-xs text-muted-foreground mb-2"
        >
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-accent transition-colors"
          >
            <Home className="h-3 w-3" />
            <span>Home</span>
          </Link>
          {breadcrumbs.map((crumb) => (
            <span key={crumb.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 opacity-50" />
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-accent transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className={cn(
              "font-display font-bold text-xl md:text-2xl text-foreground",
              "relative inline-block",
            )}
          >
            {title}
            <span
              className="absolute bottom-0 left-0 h-0.5 w-8 bg-accent rounded-full"
              aria-hidden="true"
            />
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
