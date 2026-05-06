import { CheckCircle2, ClipboardList, FileText } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickCard {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
  ocid: string;
  onClick: () => void;
}

export interface CandidateQuickAccessCardsProps {
  onApplyClick?: () => void;
  onStatusClick?: () => void;
  onApplicationFormClick?: () => void;
  applicationStatus?: string;
  applicationOpenStatus?: string;
}

// ─── Individual card ──────────────────────────────────────────────────────────

function ModuleCard({ card }: { card: QuickCard }) {
  return (
    <button
      type="button"
      onClick={card.onClick}
      data-ocid={card.ocid}
      aria-label={card.title}
      className={[
        "relative overflow-hidden rounded-xl h-40 w-full cursor-pointer",
        "text-white text-left shadow-md",
        "hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]",
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2",
        card.gradient,
      ].join(" ")}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />

      {/* Top icon */}
      <div className="absolute top-4 left-4 z-10">
        <div className="w-10 h-10 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center shadow-sm">
          {card.icon}
        </div>
      </div>

      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />

      {/* Bottom text */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-4 pb-4">
        <p className="font-bold text-base leading-tight text-white drop-shadow">
          {card.title}
        </p>
        <p className="text-white/80 text-xs mt-0.5 leading-snug drop-shadow">
          {card.subtitle}
        </p>
      </div>
    </button>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CandidateQuickAccessCards({
  onApplyClick,
  onStatusClick,
  onApplicationFormClick,
  applicationStatus = "Pending",
  applicationOpenStatus = "Application Open",
}: CandidateQuickAccessCardsProps) {
  const isOpen = applicationOpenStatus === "Application Open";

  const cards: QuickCard[] = [
    {
      id: "apply",
      title: "Apply Online",
      subtitle: isOpen ? "Click to apply now" : "Apply Online",
      icon: <FileText className="h-5 w-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#16a34a] to-[#14532d]",
      ocid: "candidate-card-apply-online",
      onClick: onApplyClick ?? (() => {}),
    },
    {
      id: "status",
      title: "Application Status",
      subtitle: applicationStatus,
      icon: <CheckCircle2 className="h-5 w-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#1d4ed8] to-[#1e3a8a]",
      ocid: "candidate-card-app-status",
      onClick: onStatusClick ?? (() => {}),
    },
    {
      id: "app-form",
      title: "Application Form",
      subtitle: "View your registered form",
      icon: <ClipboardList className="h-5 w-5 text-white" />,
      gradient: "bg-gradient-to-br from-[#d97706] to-[#92400e]",
      ocid: "candidate-card-app-form",
      onClick: onApplicationFormClick ?? (() => {}),
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
      data-ocid="candidate-quick-access-cards"
    >
      {cards.map((card) => (
        <ModuleCard key={card.id} card={card} />
      ))}
    </div>
  );
}
