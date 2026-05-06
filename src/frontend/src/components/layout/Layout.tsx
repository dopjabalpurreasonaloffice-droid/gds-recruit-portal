import { ChatBot } from "@/components/ChatBot";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(130);

  // Measure header height to correctly offset sidebar and content
  useEffect(() => {
    const measure = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div
      className="flex flex-col min-h-screen bg-background overflow-x-hidden"
      style={{ "--header-height": `${headerHeight}px` } as React.CSSProperties}
    >
      {/* Fixed Header */}
      <div ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
        <Header onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      </div>

      {/* Body: sidebar + main content — pushed down by fixed header */}
      <div
        className="flex flex-1 relative"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content: offset by sidebar on large screens — no nested scrollbars */}
        <main
          className={cn(
            "flex-1 flex flex-col min-h-0 min-w-0",
            "overflow-x-hidden",
            "lg:ml-[250px]",
            "transition-[margin] duration-300",
          )}
        >
          <div className="flex-1 px-4 py-4 lg:px-6 lg:py-5 pb-10">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
          <Footer />
        </main>
      </div>
      <ChatBot />
    </div>
  );
}
