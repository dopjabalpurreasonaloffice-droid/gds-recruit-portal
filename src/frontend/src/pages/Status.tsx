import { ApplicationStatus, PaymentStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import { PageTitle } from "@/components/ui/page-title";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useMyApplications, useMyPayments } from "@/hooks/useQueries";
import {
  APPLICATION_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Lock,
  MapPin,
  Printer,
  User,
} from "lucide-react";
import { useState } from "react";

interface TimelineStep {
  id: number;
  label: string;
  description: string;
  status: "done" | "current" | "pending";
  date?: string;
}

function getTimelineSteps(
  appStatus: ApplicationStatus,
  payStatus: PaymentStatus,
  submittedAt?: bigint,
): TimelineStep[] {
  const submittedDate = submittedAt
    ? new Date(Number(submittedAt) / 1_000_000).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : undefined;

  const isSubmitted = appStatus !== ApplicationStatus.draft;
  const isFeePaid =
    payStatus === PaymentStatus.success ||
    payStatus === PaymentStatus.notRequired;
  const isUnderReview =
    appStatus === ApplicationStatus.underReview ||
    appStatus === ApplicationStatus.shortlisted ||
    appStatus === ApplicationStatus.rejected;
  const isShortlisted = appStatus === ApplicationStatus.shortlisted;
  const isRejected = appStatus === ApplicationStatus.rejected;

  return [
    {
      id: 1,
      label: "Registration Complete",
      description: "Candidate registered successfully on the portal.",
      status: "done",
      date: "Completed",
    },
    {
      id: 2,
      label: "Application Submitted",
      description:
        "Online application form submitted with all required details.",
      status: isSubmitted ? "done" : "current",
      date: submittedDate,
    },
    {
      id: 3,
      label: "Fee Payment",
      description: "Application fee paid / exempted as applicable.",
      status: isFeePaid ? "done" : isSubmitted ? "current" : "pending",
      date: isFeePaid ? "Confirmed" : undefined,
    },
    {
      id: 4,
      label: "Application Under Review",
      description: "Application is being verified by the recruiting authority.",
      status: isUnderReview
        ? appStatus === ApplicationStatus.underReview
          ? "current"
          : "done"
        : "pending",
      date: isUnderReview ? undefined : undefined,
    },
    {
      id: 5,
      label: isRejected ? "Application Rejected" : "Shortlisted",
      description: isRejected
        ? "Application did not meet selection criteria."
        : "Candidate shortlisted based on merit list.",
      status: isShortlisted || isRejected ? "done" : "pending",
      date: isShortlisted || isRejected ? "Result Declared" : undefined,
    },
    {
      id: 6,
      label: "Document Verification",
      description: "Original documents to be verified at the circle office.",
      status: isShortlisted ? "current" : "pending",
      date: isShortlisted ? "Scheduled" : undefined,
    },
  ];
}

function TimelineItem({
  step,
  isLast,
}: { step: TimelineStep; isLast: boolean }) {
  const iconClass = {
    done: "bg-green-500 text-white",
    current: "bg-primary text-primary-foreground",
    pending: "bg-muted text-muted-foreground",
  }[step.status];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-smooth",
            iconClass,
          )}
          aria-label={`Step ${step.id}: ${step.status}`}
        >
          {step.status === "done" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : step.status === "current" ? (
            <Clock className="h-4 w-4" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "w-0.5 flex-1 min-h-[2rem] mt-1",
              step.status === "done" ? "bg-green-400" : "bg-border",
            )}
          />
        )}
      </div>
      <div className="pb-5 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p
            className={cn(
              "font-semibold text-sm",
              step.status === "done" && "text-green-700 dark:text-green-400",
              step.status === "current" && "text-primary",
              step.status === "pending" && "text-muted-foreground",
            )}
          >
            {step.label}
          </p>
          {step.date && (
            <span className="text-xs text-muted-foreground shrink-0">
              {step.date}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {step.description}
        </p>
        {step.status === "current" && (
          <span className="inline-flex items-center gap-1 mt-1 text-xs text-primary bg-primary/10 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            In Progress
          </span>
        )}
      </div>
    </div>
  );
}

function AccordionSection({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
        data-ocid={`accordion-${title.toLowerCase().replace(/\s+/g, "-")}`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="px-4 py-4 text-sm text-foreground border-t border-border bg-card">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-medium text-xs text-right">{value ?? "—"}</span>
    </div>
  );
}

export default function Status() {
  const { user, isAuthenticated } = useAuth();
  const { data: applications, isLoading: appLoading } = useMyApplications();
  const { data: payments } = useMyPayments();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Login Required
        </h2>
        <p className="text-muted-foreground max-w-sm">
          You must be logged in to view your application status.
        </p>
        <Button asChild>
          <Link to="/login">Login to Continue</Link>
        </Button>
      </div>
    );
  }

  if (appLoading) {
    return (
      <div className="space-y-4 p-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  const application = applications?.[0] ?? null;
  const payment = payments?.find(
    (p) => application && p.applicationId === application.id,
  );

  if (!application) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <PageTitle
          title="Application Status"
          breadcrumbs={[{ label: "Status" }]}
        />
        <Card>
          <CardContent
            className="pt-8 pb-8 text-center space-y-3"
            data-ocid="no-application-empty"
          >
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="font-semibold text-foreground">
              No Application Found
            </p>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              You have not submitted an application yet. Apply online to track
              your status here.
            </p>
            <Button asChild className="mt-2">
              <Link to="/apply">Apply Online</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const appStatus = application.status as ApplicationStatus;
  const payStatus = (application.paymentStatus ??
    PaymentStatus.pending) as PaymentStatus;
  const steps = getTimelineSteps(appStatus, payStatus, application.submittedAt);

  const createdDate = new Date(
    Number(application.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const payStatusLabels: Record<string, string> = {
    pending: "Pending",
    success: "Paid",
    failed: "Failed",
    notRequired: "Not Required",
  };
  const payStatusColors: Record<string, string> = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-destructive/10 text-destructive",
    notRequired: "bg-muted text-muted-foreground",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 print:space-y-4 print:p-0">
      <PageTitle
        title="Application Status"
        subtitle={`Application No: APP${application.id.toString().padStart(8, "0")}`}
        breadcrumbs={[{ label: "Application Status" }]}
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 hidden sm:flex"
              onClick={() => window.print()}
              data-ocid="print-application-btn"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => alert("Application PDF downloaded.")}
              data-ocid="download-application-btn"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        }
      />

      {/* Application Info Card */}
      <Card data-ocid="application-info-card">
        <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-semibold text-foreground">
              Application Details
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                className={cn(
                  "text-xs",
                  APPLICATION_STATUS_COLORS[appStatus] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                {APPLICATION_STATUS_LABELS[appStatus] ?? appStatus}
              </Badge>
              <Badge
                className={cn(
                  "text-xs",
                  payStatusColors[payStatus] ??
                    "bg-muted text-muted-foreground",
                )}
              >
                Fee: {payStatusLabels[payStatus] ?? payStatus}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">
                Application ID
              </p>
              <p className="font-mono font-bold text-foreground">
                APP{application.id.toString().padStart(8, "0")}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">
                Candidate Name
              </p>
              <p className="font-semibold text-foreground">
                {user?.name ?? "Ramesh Kumar"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">
                Submission Date
              </p>
              <p className="font-medium text-foreground">{createdDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">
                Post Applied
              </p>
              <p className="font-medium text-foreground">
                {application.preferences.postCategory}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Circle</p>
              <p className="font-medium text-foreground">
                {application.preferences.circle}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">Division</p>
              <p className="font-medium text-foreground">
                {application.preferences.division}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card data-ocid="status-timeline">
        <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
          <CardTitle className="text-base font-semibold text-foreground">
            Application Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5">
          <div>
            {steps.map((step, idx) => (
              <TimelineItem
                key={step.id}
                step={step}
                isLast={idx === steps.length - 1}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Application Details Accordion */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">
          Detailed Application Information
        </h2>

        <AccordionSection icon={User} title="Personal Information">
          <div className="space-y-0.5">
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Mobile" value={user?.mobile} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Gender" value="—" />
            <InfoRow label="Date of Birth" value="—" />
            <InfoRow label="Category" value="—" />
            <InfoRow label="Aadhaar (masked)" value="XXXX XXXX XXXX" />
          </div>
        </AccordionSection>

        <AccordionSection icon={GraduationCap} title="Education Details">
          <div className="space-y-0.5">
            <InfoRow
              label="Board of Study"
              value={application.educationDetails.boardName}
            />
            <InfoRow
              label="Year of Passing"
              value={application.educationDetails.yearOfPassing}
            />
            <InfoRow
              label="Marks Obtained"
              value={application.educationDetails.marksObtained?.toString()}
            />
            <InfoRow
              label="Total Marks"
              value={application.educationDetails.totalMarks?.toString()}
            />
            <InfoRow
              label="Percentage"
              value={
                application.educationDetails.percentage
                  ? `${application.educationDetails.percentage.toFixed(2)}%`
                  : undefined
              }
            />
          </div>
        </AccordionSection>

        <AccordionSection icon={MapPin} title="Preferences & Post Applied">
          <div className="space-y-0.5">
            <InfoRow
              label="Post Category"
              value={application.preferences.postCategory}
            />
            <InfoRow label="State" value={application.preferences.state} />
            <InfoRow label="Circle" value={application.preferences.circle} />
            <InfoRow
              label="Division"
              value={application.preferences.division}
            />
          </div>
        </AccordionSection>

        <AccordionSection icon={FileText} title="Documents Uploaded">
          {application.documentUrls.length > 0 ? (
            <ul className="space-y-1">
              {application.documentUrls.map((url) => (
                <li key={url} className="text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {url.split("/").pop() ?? url}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-xs italic">
              No documents uploaded yet.
            </p>
          )}
        </AccordionSection>
      </div>

      {/* Payment Info */}
      {payment && (
        <Card>
          <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
            <CardTitle className="text-base font-semibold text-foreground">
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-0.5">
            <InfoRow
              label="Transaction ID"
              value={payment.transactionId || "—"}
            />
            <InfoRow
              label="Amount Paid"
              value={`₹${payment.amount.toString()}`}
            />
            <InfoRow
              label="Payment Method"
              value={payment.method ? String(payment.method) : "—"}
            />
            <InfoRow
              label="Payment Status"
              value={
                payStatusLabels[payment.status as string] ??
                String(payment.status)
              }
            />
          </CardContent>
        </Card>
      )}

      {/* Important Notice */}
      <div
        className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg p-4"
        role="alert"
        data-ocid="important-notice"
      >
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
          <p className="font-semibold">Important Notice</p>
          <p className="text-xs leading-relaxed">
            Do not contact the office regarding status updates. The recruitment
            process is entirely merit-based and computerized. Status will be
            updated automatically on this portal. Any attempt to influence the
            process is punishable under law.
          </p>
        </div>
      </div>

      <Separator />

      {/* Print / Download Actions */}
      <div className="flex gap-3 print:hidden">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => window.print()}
          data-ocid="print-application-bottom"
        >
          <Printer className="h-4 w-4" />
          Print Application
        </Button>
        <Button
          type="button"
          className="flex-1 gap-2"
          onClick={() => alert("Application PDF downloaded.")}
          data-ocid="download-application-bottom"
        >
          <Download className="h-4 w-4" />
          Download Application PDF
        </Button>
      </div>
    </div>
  );
}
