import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Layout } from "@/components/layout/Layout";
import { SiteAdminLayout } from "@/components/site-admin/SiteAdminLayout";
import { Toaster } from "@/components/ui/sonner";
import { isTokenValid } from "@/lib/admin-auth";
import { isSiteAdminTokenValid } from "@/lib/site-admin-auth";
import Apply from "@/pages/Apply";
import CandidateDashboard from "@/pages/CandidateDashboard";
import CandidateLogin from "@/pages/CandidateLogin";
import CirclePosts from "@/pages/CirclePosts";
import DescriptiveNotification from "@/pages/DescriptiveNotification";
import FeePayment from "@/pages/FeePayment";
import Grievance from "@/pages/Grievance";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import MyApplications from "@/pages/MyApplications";
import Notifications from "@/pages/Notifications";
import Register from "@/pages/Register";
import Shortlisted from "@/pages/Shortlisted";
import Status from "@/pages/Status";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLogin from "@/pages/admin/AdminLogin";
import CandidateManagement from "@/pages/admin/CandidateManagement";
import DocumentManagement from "@/pages/admin/DocumentManagement";
import FeeStatus from "@/pages/admin/FeeStatus";
import NotificationsManagement from "@/pages/admin/NotificationsManagement";
import RegisterCandidate from "@/pages/admin/RegisterCandidate";
import SlipGenerate from "@/pages/admin/SlipGenerate";
import SupplementaryRegistration from "@/pages/admin/SupplementaryRegistration";
import VacancyManagement from "@/pages/admin/VacancyManagement";
import SiteAdminBanners from "@/pages/site-admin/SiteAdminBanners";
import SiteAdminCandidateSettings from "@/pages/site-admin/SiteAdminCandidateSettings";
import SiteAdminDashboard from "@/pages/site-admin/SiteAdminDashboard";
import SiteAdminDates from "@/pages/site-admin/SiteAdminDates";
import SiteAdminLetters from "@/pages/site-admin/SiteAdminLetters";
import SiteAdminLogin from "@/pages/site-admin/SiteAdminLogin";
import SiteAdminNotifications from "@/pages/site-admin/SiteAdminNotifications";
import SiteAdminRecruitment from "@/pages/site-admin/SiteAdminRecruitment";
import SiteAdminTenders from "@/pages/site-admin/SiteAdminTenders";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";

// ─────────────────────────────────────────────
// Root: bare outlet — children choose their own shell
// ─────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ─────────────────────────────────────────────
// Public layout wrapper
// ─────────────────────────────────────────────

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: Layout,
});

// ─────────────────────────────────────────────
// Public routes (all nested under public layout)
// ─────────────────────────────────────────────

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/register",
  component: Register,
});

const notificationsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/notifications",
  component: Notifications,
});

const descriptiveNotificationRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/descriptive-notification",
  component: DescriptiveNotification,
});

const circlePostsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/circle-posts",
  component: CirclePosts,
});

const shortlistedRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/shortlisted",
  component: Shortlisted,
});

const grievanceRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/grievance",
  component: Grievance,
});

// ─────────────────────────────────────────────
// Protected public routes
// ─────────────────────────────────────────────

function getStoredUser() {
  try {
    const raw = localStorage.getItem("portal-user");
    if (!raw) return null;
    return JSON.parse(raw) as { role: string } | null;
  } catch {
    return null;
  }
}

const applyRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/apply",
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/login" });
  },
  component: Apply,
});

const feePaymentRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/fee-payment",
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/login" });
  },
  component: FeePayment,
});

const statusRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/status",
  beforeLoad: () => {
    if (!getStoredUser()) throw redirect({ to: "/login" });
  },
  component: Status,
});

// ─────────────────────────────────────────────
// Admin routes — frameless (no public Layout)
// ─────────────────────────────────────────────

// /admin/login — standalone page (always accessible, no auth guard)
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLogin,
});

// /admin parent — auth guard + AdminLayout shell
function AdminShell() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

const adminParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: ({ location }) => {
    // Skip guard for login page (handled by adminLoginRoute above)
    if (location.pathname === "/admin/login") return;
    if (!isTokenValid()) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminShell,
});

// /admin (exact) → redirect to /admin/dashboard when authenticated
const adminIndexRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
  component: () => null,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/dashboard",
  component: AdminDashboard,
});

const adminRegisterCandidateRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/register-candidate",
  component: RegisterCandidate,
});

const adminSupplementaryRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/supplementary",
  component: SupplementaryRegistration,
});

const adminCandidatesRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/candidates",
  component: CandidateManagement,
});

const adminDocumentsRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/documents",
  component: DocumentManagement,
});

const adminFeeStatusRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/fee-status",
  component: FeeStatus,
});

const adminVacanciesRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/vacancies",
  component: VacancyManagement,
});

const adminSlipGenerateRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/slip-generate",
  component: SlipGenerate,
});

const adminNotificationsRoute = createRoute({
  getParentRoute: () => adminParentRoute,
  path: "/notifications",
  component: NotificationsManagement,
});

// ─────────────────────────────────────────────
// Site Admin routes — frameless (no public Layout)
// ─────────────────────────────────────────────

// /site-admin/login — standalone page (always accessible, no auth guard)
const siteAdminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/site-admin/login",
  component: SiteAdminLogin,
});

// /site-admin parent — auth guard + SiteAdminLayout shell
function SiteAdminShell() {
  return (
    <SiteAdminLayout>
      <Outlet />
    </SiteAdminLayout>
  );
}

const siteAdminParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/site-admin",
  beforeLoad: ({ location }) => {
    if (location.pathname === "/site-admin/login") return;
    if (!isSiteAdminTokenValid()) {
      throw redirect({ to: "/site-admin/login" });
    }
  },
  component: SiteAdminShell,
});

const siteAdminDashboardRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/dashboard",
  component: SiteAdminDashboard,
});

const siteAdminNotificationsRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/notifications",
  component: SiteAdminNotifications,
});

const siteAdminLettersRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/letters",
  component: SiteAdminLetters,
});

const siteAdminTendersRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/tenders",
  component: SiteAdminTenders,
});

const siteAdminRecruitmentRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/recruitment",
  component: SiteAdminRecruitment,
});

const siteAdminBannersRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/banners",
  component: SiteAdminBanners,
});

const siteAdminDatesRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/dates",
  component: SiteAdminDates,
});

const siteAdminCandidateSettingsRoute = createRoute({
  getParentRoute: () => siteAdminParentRoute,
  path: "/candidate-settings",
  component: SiteAdminCandidateSettings,
});

// ─────────────────────────────────────────────
// Candidate portal routes — standalone (no public Layout shell)
// ─────────────────────────────────────────────

// /candidate/login — always accessible
const candidateLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/login",
  component: CandidateLogin,
});

// /candidate/dashboard — protected: redirect to /candidate/login if no token
const candidateDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/dashboard",
  beforeLoad: () => {
    const token = localStorage.getItem("candidateToken");
    if (!token) throw redirect({ to: "/candidate/login" });
  },
  component: CandidateDashboard,
});

// /candidate/my-applications — protected
const candidateMyApplicationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/candidate/my-applications",
  beforeLoad: () => {
    const token = localStorage.getItem("candidateToken");
    if (!token) throw redirect({ to: "/candidate/login" });
  },
  component: MyApplications,
});

// ─────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    loginRoute,
    registerRoute,
    notificationsRoute,
    descriptiveNotificationRoute,
    circlePostsRoute,
    shortlistedRoute,
    grievanceRoute,
    applyRoute,
    feePaymentRoute,
    statusRoute,
  ]),
  candidateLoginRoute,
  candidateDashboardRoute,
  candidateMyApplicationsRoute,
  adminLoginRoute,
  adminParentRoute.addChildren([
    adminIndexRoute,
    adminDashboardRoute,
    adminRegisterCandidateRoute,
    adminSupplementaryRoute,
    adminCandidatesRoute,
    adminDocumentsRoute,
    adminFeeStatusRoute,
    adminVacanciesRoute,
    adminSlipGenerateRoute,
    adminNotificationsRoute,
  ]),
  siteAdminLoginRoute,
  siteAdminParentRoute.addChildren([
    siteAdminDashboardRoute,
    siteAdminNotificationsRoute,
    siteAdminLettersRoute,
    siteAdminTendersRoute,
    siteAdminRecruitmentRoute,
    siteAdminBannersRoute,
    siteAdminDatesRoute,
    siteAdminCandidateSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </ErrorBoundary>
  );
}
