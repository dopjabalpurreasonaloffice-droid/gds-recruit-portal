export const PORTAL_NAME = "GDS Online Engagement - Regional Office Jabalpur";
export const PORTAL_YEAR = "2024-25";
export const FEE_AMOUNT = 100;
export const FEE_EXEMPTED_CATEGORIES = ["SC", "ST", "PwD", "Female"];

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export const CATEGORIES: { value: string; label: string }[] = [
  { value: "UR", label: "Unreserved (General)" },
  { value: "OBC", label: "OBC (Other Backward Classes)" },
  { value: "SC", label: "SC (Scheduled Caste)" },
  { value: "ST", label: "ST (Scheduled Tribe)" },
  { value: "EWS", label: "EWS (Economically Weaker Section)" },
];

export const SUBCATEGORIES: { value: string; label: string }[] = [
  { value: "NONE", label: "None" },
  { value: "PWD", label: "PwD (Person with Disability)" },
  { value: "ExSM", label: "Ex-Serviceman" },
  { value: "Trans", label: "Transgender" },
];

export const EDUCATION_BOARDS: string[] = [
  "CBSE (Central Board of Secondary Education)",
  "ICSE (Indian Certificate of Secondary Education)",
  "Andhra Pradesh Board of Secondary Education",
  "Arunachal Pradesh Board of Secondary Education",
  "Assam Secondary Education Board",
  "Bihar School Examination Board",
  "Chhattisgarh Board of Secondary Education",
  "Goa Board of Secondary and Higher Secondary Education",
  "Gujarat Secondary and Higher Secondary Education Board",
  "Haryana Board of School Education",
  "Himachal Pradesh Board of School Education",
  "Jharkhand Academic Council",
  "Karnataka Secondary Education Examination Board",
  "Kerala Board of Public Examinations",
  "Madhya Pradesh Board of Secondary Education",
  "Maharashtra State Board of Secondary and Higher Secondary Education",
  "Manipur Board of Secondary Education",
  "Meghalaya Board of School Education",
  "Mizoram Board of School Education",
  "Nagaland Board of School Education",
  "Odisha Board of Secondary Education",
  "Punjab School Education Board",
  "Rajasthan Board of Secondary Education",
  "Sikkim Board of Secondary Education",
  "Tamil Nadu Board of Secondary Education",
  "Telangana State Board of Secondary Education",
  "Tripura Board of Secondary Education",
  "Uttar Pradesh Madhyamik Shiksha Parishad",
  "Uttarakhand Board of School Education",
  "West Bengal Board of Secondary Education",
  "J&K State Board of School Education",
  "State Open School",
  "National Open School (NOS)",
];

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  underReview: "Under Review",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary/10 text-primary",
  underReview: "bg-accent/20 text-accent-foreground",
  shortlisted:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rejected: "bg-destructive/10 text-destructive",
};

export const PAYMENT_METHODS: { value: string; label: string; icon: string }[] =
  [
    { value: "upi", label: "UPI / BHIM / Google Pay", icon: "smartphone" },
    { value: "netbanking", label: "Net Banking", icon: "landmark" },
    { value: "card", label: "Debit / Credit Card", icon: "credit-card" },
  ];

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  success: "Paid",
  failed: "Failed",
  notRequired: "Not Required",
};

export const NOTIF_TYPES: { value: string; label: string; color: string }[] = [
  { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-700" },
  {
    value: "important",
    label: "Important",
    color: "bg-amber-100 text-amber-700",
  },
  {
    value: "general",
    label: "General",
    color: "bg-blue-100 text-blue-700",
  },
];

export const POST_CATEGORIES: { value: string; label: string }[] = [
  { value: "BPM", label: "Branch Post Master (BPM)" },
  { value: "ABPM", label: "Assistant Branch Post Master (ABPM)" },
  { value: "Dak Sevak", label: "Dak Sevak" },
];

export const GENDER_OPTIONS: { value: string; label: string }[] = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Transgender", label: "Transgender" },
];

export const IMPORTANT_DATES = [
  {
    event: "Notification Released",
    date: "15 Jan 2025",
    status: "completed",
  },
  {
    event: "Registration Start Date",
    date: "01 Feb 2025",
    status: "completed",
  },
  {
    event: "Registration End Date",
    date: "31 Mar 2025",
    status: "active",
  },
  {
    event: "Fee Payment Window",
    date: "01 Feb – 31 Mar 2025",
    status: "active",
  },
  {
    event: "Application Correction Window",
    date: "10 Apr – 20 Apr 2025",
    status: "upcoming",
  },
  {
    event: "Shortlist Publication",
    date: "Jun 2025 (Tentative)",
    status: "upcoming",
  },
];

export const ANNOUNCEMENTS = [
  "📢 Notification for GDS Recruitment 2024-25 is released. Apply before the last date.",
  "⚠️ Last date for application submission: March 31, 2025.",
  "💳 Fee payment window is open: Feb 1 – Mar 31, 2025.",
  "📋 Candidates must upload clear photograph and signature as per specifications.",
  "ℹ️ Help Desk: For queries, call 011-23096086 (Mon–Fri, 10 AM – 5 PM).",
  "🔔 Admit cards will be available after document verification.",
];
