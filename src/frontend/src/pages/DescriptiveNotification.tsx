import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageTitle } from "@/components/ui/page-title";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { PORTAL_NAME, PORTAL_YEAR } from "@/lib/constants";
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  Printer,
  Users,
} from "lucide-react";
import { motion } from "motion/react";

// ─── Static Content ──────────────────────────────────────────────────────────

const NOTIF_META = {
  number: "Notification No. 01/2024-25",
  authority:
    "Department of Posts, Ministry of Communications, Government of India",
  subject: "Recruitment of Gramin Dak Sevak (GDS) in Department of Posts",
  totalPosts: "52,000+",
  lastDate: "31 March 2025",
  websiteUrl: "https://indiapostgdsonline.gov.in",
};

const POST_TYPES = [
  {
    name: "Branch Post Master (BPM)",
    eligibility: "Class 10 Pass with basic computer knowledge",
    workHours: "4 hours/day",
    trco: "Type II & III TRCO",
    timeRelated: "TRCO + ₹2,295 - ₹45,440",
  },
  {
    name: "Assistant Branch Post Master (ABPM)",
    eligibility: "Class 10 Pass with basic computer knowledge",
    workHours: "4 hours/day",
    trco: "Type II TRCO",
    timeRelated: "TRCO + ₹2,295 - ₹45,440",
  },
  {
    name: "Dak Sevak",
    eligibility: "Class 10 Pass",
    workHours: "5 hours/day",
    trco: "Type I & II TRCO",
    timeRelated: "TRCO + ₹10,000 - ₹24,470",
  },
];

const FEE_TABLE = [
  {
    category: "UR / OBC / EWS (Male)",
    amount: "₹100",
    mode: "UPI / Net Banking / Debit/Credit Card",
  },
  { category: "SC / ST", amount: "Nil (Exempt)", mode: "—" },
  { category: "PwD (All categories)", amount: "Nil (Exempt)", mode: "—" },
  { category: "Female (All categories)", amount: "Nil (Exempt)", mode: "—" },
];

const ELIGIBILITY_CRITERIA = [
  {
    point: "Age Limit",
    detail:
      "Minimum 18 years, Maximum 40 years as on 01.01.2025. Age relaxation applicable as per Government rules.",
  },
  {
    point: "Educational Qualification",
    detail:
      "Secondary School Examination (Class 10) pass certificate from a recognized Board/School, with Mathematics and English as compulsory or elective subjects.",
  },
  {
    point: "Computer Knowledge",
    detail:
      "For BPM/ABPM posts: Basic Computer Training Certificate for minimum 60 days from a recognized institution is mandatory.",
  },
  {
    point: "Local Language",
    detail:
      "Knowledge of local language of the Division/Unit applied for is mandatory.",
  },
  { point: "Cycling", detail: "Candidate must be able to ride a bicycle." },
];

const SELECTION_PROCESS = [
  {
    step: "1",
    title: "Online Application",
    desc: "Submit online application through the official portal within the stipulated time.",
  },
  {
    step: "2",
    title: "Merit List Generation",
    desc: "Merit list is prepared based on Class 10th marks percentage. No written examination.",
  },
  {
    step: "3",
    title: "Document Verification",
    desc: "Shortlisted candidates are called for document verification at the respective Circle/Division office.",
  },
  {
    step: "4",
    title: "Engagement",
    desc: "Final engagement of selected candidates as GDS on provisional basis, subject to satisfactory verification.",
  },
];

const IMPORTANT_INSTRUCTIONS = [
  "Candidates must apply online only. No offline application will be accepted.",
  "One candidate can submit only ONE application. Multiple applications will be rejected.",
  "Photograph (recent passport size, white background) and Signature must be uploaded in prescribed format.",
  "Mobile number must be valid and active throughout the recruitment process.",
  "Keep application printout and payment receipt safely for future reference.",
  "The Department reserves the right to cancel the notification at any stage without assigning any reason.",
];

// ─── Section components ───────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
}: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
      <div className="p-1.5 rounded bg-primary/10 shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="font-semibold text-base text-foreground">{title}</h2>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DescriptiveNotification() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle
        title={t("pages.descriptiveNotification.title")}
        subtitle={t("pages.descriptiveNotification.subtitle")}
        breadcrumbs={[{ label: t("pages.descriptiveNotification.title") }]}
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 hidden sm:flex"
              data-ocid="notif-print-btn"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              data-ocid="notif-download-btn"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        }
      />

      {/* Official Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-border mb-5">
          <CardContent className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
              {NOTIF_META.authority}
            </p>
            <h1 className="font-display font-bold text-xl text-foreground mb-1">
              {PORTAL_NAME}
            </h1>
            <p className="text-sm font-semibold text-muted-foreground mb-2">
              {NOTIF_META.number}
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-primary bg-primary/5 border border-primary/20 px-3 py-1.5 rounded-full">
              <Calendar className="h-3 w-3" />
              Recruitment Year: {PORTAL_YEAR}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-primary/30 bg-primary/5 mb-5">
          <CardContent className="p-4">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              Subject
            </p>
            <p className="text-sm font-semibold text-foreground">
              {NOTIF_META.subject}
            </p>
            <Separator className="my-3" />
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Total Posts:</span>
                <span className="font-bold text-foreground">
                  {NOTIF_META.totalPosts}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Date:</span>
                <span className="font-bold text-foreground">
                  {NOTIF_META.lastDate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-5">
        {/* Post Types */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-border">
            <CardContent className="p-5">
              <SectionHeader icon={BookOpen} title="Post Details" />
              <div className="space-y-3">
                {POST_TYPES.map((post) => (
                  <div
                    key={post.name}
                    className="p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <p className="font-semibold text-sm text-foreground mb-1.5">
                      {post.name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <span>
                        <strong className="text-foreground">
                          Eligibility:
                        </strong>{" "}
                        {post.eligibility}
                      </span>
                      <span>
                        <strong className="text-foreground">Work Hours:</strong>{" "}
                        {post.workHours}
                      </span>
                      <span>
                        <strong className="text-foreground">TRCO Type:</strong>{" "}
                        {post.trco}
                      </span>
                      <span>
                        <strong className="text-foreground">TRCO Range:</strong>{" "}
                        {post.timeRelated}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Eligibility */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-border">
            <CardContent className="p-5">
              <SectionHeader icon={CheckCircle} title="Eligibility Criteria" />
              <div className="space-y-2.5">
                {ELIGIBILITY_CRITERIA.map((item) => (
                  <div key={item.point} className="flex gap-3 text-sm">
                    <span className="font-semibold text-foreground flex-shrink-0 min-w-[140px]">
                      {item.point}:
                    </span>
                    <span className="text-muted-foreground leading-relaxed">
                      {item.detail}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Selection Process */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-border">
            <CardContent className="p-5">
              <SectionHeader icon={Users} title="Selection Process" />
              <div className="space-y-0">
                {SELECTION_PROCESS.map((step, i) => (
                  <div key={step.step} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {step.step}
                      </div>
                      {i < SELECTION_PROCESS.length - 1 && (
                        <div
                          className="w-px flex-1 bg-primary/20 my-1"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-semibold text-sm text-foreground">
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Structure */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-border">
            <CardContent className="p-5">
              <SectionHeader
                icon={CreditCard}
                title="Application Fee Structure"
              />
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted border-b-2 border-border">
                      <th className="text-left px-3 py-2.5 font-semibold text-foreground text-xs">
                        Category
                      </th>
                      <th className="text-left px-3 py-2.5 font-semibold text-foreground text-xs">
                        Amount
                      </th>
                      <th className="text-left px-3 py-2.5 font-semibold text-foreground text-xs">
                        Payment Mode
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEE_TABLE.map((row, i) => (
                      <tr
                        key={row.category}
                        className={`hover:bg-muted/30 transition-colors ${
                          i % 2 === 0 ? "bg-background" : "bg-muted/20"
                        }`}
                      >
                        <td className="px-3 py-2 text-sm text-foreground">
                          {row.category}
                        </td>
                        <td className="px-3 py-2 text-sm font-semibold text-foreground">
                          {row.amount}
                        </td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {row.mode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="font-display font-bold text-base text-foreground">
                  Important Instructions
                </h2>
              </div>
              <ol className="space-y-2">
                {IMPORTANT_INSTRUCTIONS.map((inst, i) => (
                  <li
                    key={`inst-${i + 1}`}
                    className="flex gap-2.5 text-sm text-foreground"
                  >
                    <span className="flex-shrink-0 font-bold text-amber-600 dark:text-amber-400">
                      {i + 1}.
                    </span>
                    <span className="leading-relaxed">{inst}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
