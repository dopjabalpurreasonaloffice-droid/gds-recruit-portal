import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  Globe,
  HelpCircle,
  Home,
  Lock,
  Settings,
  X,
} from "lucide-react";
import { type ReactNode, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SubItem {
  label: string;
  path: string;
  requiresAuth?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  expandable?: boolean;
  path?: string;
  subItems?: SubItem[];
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "notification",
    label: "Notification",
    icon: <Bell className="h-4 w-4 shrink-0" />,
    expandable: true,
    subItems: [
      { label: "Notification-English", path: "/notifications" },
      { label: "Notification-Hindi", path: "/notifications" },
      { label: "Circlewise Posts Notified", path: "/circle-posts" },
    ],
  },
  {
    id: "vacant-posts",
    label: "Vacant Posts",
    icon: <Briefcase className="h-4 w-4 shrink-0" />,
    expandable: true,
    subItems: [
      { label: "State-wise Vacant Posts", path: "/circle-posts" },
      { label: "Circle-wise Posts", path: "/circle-posts" },
    ],
  },
  {
    id: "annexures",
    label: "Annexures",
    icon: <FolderOpen className="h-4 w-4 shrink-0" />,
    expandable: true,
    subItems: [
      { label: "Annexure-I", path: "/notifications" },
      { label: "Annexure-II", path: "/notifications" },
      { label: "Annexure-III", path: "/notifications" },
    ],
  },
  {
    id: "helpdesk",
    label: "Helpdesk",
    icon: <HelpCircle className="h-4 w-4 shrink-0" />,
    expandable: true,
    subItems: [
      { label: "Candidate Grievance", path: "/grievance" },
      { label: "Contact Us", path: "/grievance" },
    ],
  },
  {
    id: "apply-online",
    label: "Apply Online",
    icon: <ClipboardList className="h-4 w-4 shrink-0" />,
    path: "/login",
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isAdmin } = useAuth();
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;

  // "notification" is expanded by default
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["notification"]),
  );

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay — closes sidebar on click */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          onKeyUp={(e) => e.key === "Escape" && onClose()}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex flex-col",
          "bg-white border-r border-gray-300",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 w-[250px]",
          "overflow-y-auto overflow-x-hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          top: "var(--header-height, 130px)",
          height: "calc(100vh - var(--header-height, 130px))",
        }}
        aria-label="Sidebar navigation"
        data-ocid="sidebar-nav"
      >
        {/* Sidebar Header */}
        <div className="px-3 py-2 bg-[#B22222] text-white flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest">Menu</p>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Home Button — always visible at top */}
        <div className="px-2 pt-2 pb-1">
          <Link
            to="/"
            onClick={onClose}
            data-ocid="sidebar-home-btn"
            className={cn(
              "flex items-center gap-2 px-3 py-2 w-full rounded text-sm font-semibold transition-colors duration-200 border border-dashed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222]",
              currentPath === "/"
                ? "bg-orange-100 text-[#B22222] border-[#B22222]"
                : "text-gray-700 hover:bg-orange-50 hover:text-[#B22222] border-gray-300 hover:border-[#B22222]",
            )}
          >
            <Home className="h-4 w-4 shrink-0" />
            <span>Home</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1" aria-label="Main navigation">
          <ul className="divide-y divide-gray-200">
            {MENU_ITEMS.map((item) => {
              const isExpanded = item.expandable
                ? expandedItems.has(item.id)
                : false;
              const itemActive = item.path ? isActive(item.path) : false;

              return (
                <li key={item.id}>
                  {/* Top-level item */}
                  {item.path && !item.expandable ? (
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                        "text-sm font-semibold transition-colors duration-200",
                        "border-l-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:ring-inset",
                        itemActive
                          ? "bg-orange-50 text-[#B22222] border-[#B22222]"
                          : "text-gray-800 hover:bg-orange-50 hover:text-[#B22222] border-transparent",
                      )}
                      data-ocid={`nav-${item.id}`}
                    >
                      <span className="text-[#B22222] shrink-0">
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => item.expandable && toggleItem(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                        "text-sm font-semibold transition-colors duration-200",
                        "border-l-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:ring-inset",
                        isExpanded
                          ? "bg-orange-50 text-[#B22222] border-[#B22222]"
                          : "text-gray-800 hover:bg-orange-50 hover:text-[#B22222] border-transparent",
                      )}
                      aria-expanded={item.expandable ? isExpanded : undefined}
                      data-ocid={`nav-${item.id}`}
                    >
                      <span
                        className={cn(
                          "shrink-0 transition-colors duration-200",
                          isExpanded ? "text-[#B22222]" : "text-gray-500",
                        )}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.expandable && (
                        <span className="shrink-0 text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5" />
                          )}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Sub-items — smooth animated expand */}
                  {item.expandable && item.subItems && (
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200 ease-in-out",
                        isExpanded
                          ? "max-h-[400px] opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <ul className="bg-gray-50 border-t border-gray-200">
                        {item.subItems.map((sub) => {
                          const active = isActive(sub.path);
                          return (
                            <li key={sub.label}>
                              <Link
                                to={sub.path}
                                onClick={onClose}
                                className={cn(
                                  "flex items-center gap-2 pl-8 pr-3 py-2 text-xs",
                                  "border-l-[3px] transition-colors duration-150",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:ring-inset",
                                  active
                                    ? "bg-orange-100 text-[#B22222] font-semibold border-[#B22222]"
                                    : "text-gray-600 hover:bg-orange-50 hover:text-[#B22222] border-transparent",
                                )}
                                aria-current={active ? "page" : undefined}
                                data-ocid={`nav-sub-${sub.path.replace(/\//g, "").replace(/-/g, "_") || "home"}`}
                              >
                                <ChevronRight className="h-3 w-3 shrink-0 text-gray-400" />
                                <span className="truncate">{sub.label}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}

            {/* Admin Panel link — shown only when already authenticated as admin */}
            {isAdmin && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigate({ to: "/admin" });
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                    "text-sm font-semibold transition-colors duration-200 border-l-[3px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B22222] focus-visible:ring-inset",
                    isActive("/admin")
                      ? "bg-orange-50 text-[#B22222] border-[#B22222]"
                      : "text-gray-800 hover:bg-orange-50 hover:text-[#B22222] border-transparent",
                  )}
                  data-ocid="nav-admin"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span>Admin Panel</span>
                </button>
              </li>
            )}

            {/* Admin Login link — always visible to non-admin users */}
            {!isAdmin && (
              <li className="border-t-2 border-dashed border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    navigate({ to: "/admin/login" });
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                    "text-xs font-medium transition-colors duration-200 border-l-[3px]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#990000] focus-visible:ring-inset",
                    isActive("/admin/login")
                      ? "bg-red-50 text-[#990000] border-[#990000]"
                      : "text-gray-500 hover:bg-red-50 hover:text-[#990000] border-transparent",
                  )}
                  data-ocid="nav-admin-login"
                >
                  <Lock className="h-3.5 w-3.5 shrink-0 text-[#990000]" />
                  <span>Admin Login</span>
                </button>
              </li>
            )}

            {/* Website Admin link — always visible at the very bottom */}
            <li className="border-t border-gray-300">
              <button
                type="button"
                onClick={() => {
                  navigate({ to: "/site-admin/login" });
                  onClose();
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-left",
                  "text-xs font-medium transition-colors duration-200 border-l-[3px]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-inset",
                  isActive("/site-admin")
                    ? "bg-indigo-50 text-indigo-700 border-indigo-600"
                    : "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 border-transparent",
                )}
                data-ocid="nav-site-admin-login"
              >
                <Globe className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>Website Admin</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Help link at bottom */}
        <div className="border-t border-gray-300 p-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            For help, visit{" "}
            <Link
              to="/grievance"
              className="text-[#B22222] hover:underline transition-colors duration-200"
              onClick={onClose}
            >
              Helpdesk
            </Link>
          </p>
        </div>
      </aside>
    </>
  );
}
