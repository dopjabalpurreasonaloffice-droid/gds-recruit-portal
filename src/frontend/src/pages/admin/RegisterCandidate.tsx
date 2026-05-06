import {
  type AdminCandidatePostPreference,
  getAvailableVacancies,
  useActiveVacancies,
  useAdminAddCandidate,
} from "@/hooks/useAdminQueries";
import { MP_POSTAL_DIVISIONS } from "@/lib/mpPostalData";
import { useEffect, useRef, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["UR", "SC", "ST", "OBC", "EWS"];
const BOARDS = [
  "Madhya Pradesh Board of Secondary Education",
  "Central Board of Secondary Education (CBSE)",
  "Council for the Indian School Certificate Examinations (ICSE)",
  "Rajasthan Board of Secondary Education",
  "UP Board of High School and Intermediate Education",
  "Bihar School Examination Board",
  "Maharashtra State Board",
  "Gujarat Secondary and Higher Secondary Education Board",
  "Karnataka Secondary Education Examination Board",
  "Other State Board",
];
const CBSE_BOARD = "Central Board of Secondary Education (CBSE)";
const DECLARATIONS = [
  "I hereby declare that all the information provided in this application is true, correct and complete to the best of my knowledge and belief.",
  "I am aware that in the event of any information being found false or incorrect, my candidature is liable to be cancelled at any stage.",
  "I have read all the instructions and I fulfil all the eligibility conditions as specified in the notification.",
  "I understand that my candidature is provisional and subject to verification of documents at the time of document verification.",
  "I declare that I have not been convicted by any court of law for any criminal offence.",
  "I declare that I am not debarred/disqualified from Government service.",
  "I agree that the selection process will be based on merit as per the marks obtained in 10th standard.",
  "I understand that no TA/DA will be paid for attending the document verification.",
  "I declare that the photograph and signature uploaded by me are genuine and recent.",
];

type ResultType = "Percentage" | "CGPA" | "Grade/Point";

interface BOPref {
  id: string;
  boName: string;
  postType: "BPM" | "ABPM";
  category: string;
  basicPay: number;
}
interface FormState {
  name: string;
  fatherName: string;
  motherName: string;
  mobile: string;
  aadhaar: string;
  email: string;
  dob: string;
  gender: string;
  category: string;
  ph: boolean;
  bicycle: string;
  employed: string;
  noc: string;
  pDoor: string;
  pVillage: string;
  pPanchayat: string;
  pPin: string;
  perDoor: string;
  perVillage: string;
  perPanchayat: string;
  perPin: string;
  sameAddr: boolean;
  stateYear: string;
  board: string;
  resultType: ResultType;
  boardRemarks: string;
  mathMarks: string;
  hindiMarks: string;
  engMarks: string;
  sciMarks: string;
  ssMarks: string;
  cgpa: string;
  pctObtained: string;
  totalGrade: string;
  doc10th: File | null;
  docPhoto: File | null;
  docId: File | null;
  docCommunity: File | null;
  docDisability: File | null;
  docEWS: File | null;
  preferences: BOPref[];
  division: string;
  declarations: boolean[];
  appDate: string;
}

function calcAge(dob: string) {
  if (!dob) return "—";
  const birth = new Date(dob);
  const ref = new Date("2025-01-05");
  let y = ref.getFullYear() - birth.getFullYear();
  let m = ref.getMonth() - birth.getMonth();
  let d = ref.getDate() - birth.getDate();
  if (d < 0) {
    m--;
    d += 30;
  }
  if (m < 0) {
    y--;
    m += 12;
  }
  return `${y} Years ${m} Months ${d} Days`;
}

// ─── Print CSS ────────────────────────────────────────────────────────────────
const PRINT_CSS = `
  #gds-printable-area { display: none; }
  .preview-action-buttons { display: flex !important; }
  @media print {
    body * { visibility: hidden !important; }
    #gds-printable-area, #gds-printable-area * { visibility: visible !important; }
    #gds-printable-area { display: block !important; position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; z-index: 9999 !important; }
    .preview-action-buttons { display: none !important; }
    @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
    #gds-printable-area { font-family: 'Times New Roman', Times, serif !important; font-size: 11px !important; color: #000 !important; background: #fff !important; }
    #gds-printable-area table { border-collapse: collapse !important; width: 100% !important; }
    #gds-printable-area td, #gds-printable-area th { border: 1px solid #000 !important; padding: 3px 5px !important; vertical-align: top !important; font-family: 'Times New Roman', Times, serif !important; font-size: 11px !important; }
    .print-section-title { background-color: #8b0000 !important; color: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-weight: bold !important; padding: 4px 8px !important; font-size: 12px !important; text-align: left !important; }
    .print-lbl { background-color: #f0f0f0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-weight: bold !important; width: 38% !important; }
    .print-page-break { page-break-before: always !important; }
    .print-photo-box { width: 90px !important; height: 110px !important; border: 1px solid #000 !important; text-align: center !important; vertical-align: middle !important; }
    .print-sig-box { width: 150px !important; height: 55px !important; border: 1px solid #000 !important; display: inline-block !important; }
    .print-header-title { color: #8b0000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-weight: bold !important; font-size: 15px !important; letter-spacing: 0.5px !important; }
  }
`;

// ─── Form Field helpers ───────────────────────────────────────────────────────
function Label({
  children,
  required,
  htmlFor,
}: { children: React.ReactNode; required?: boolean; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-foreground mb-1"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}
function SectionCard({
  title,
  children,
  icon,
}: { title: string; children: React.ReactNode; icon?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm mb-5 w-full">
      <div className="w-full bg-gradient-to-r from-red-800 to-red-700 px-5 py-3 flex items-center gap-2 rounded-t-xl">
        {icon && (
          <span className="text-white text-base leading-none">{icon}</span>
        )}
        <h2 className="text-white font-semibold text-sm tracking-wide uppercase leading-tight w-full">
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
function InputField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

// ─── Shared print table content (used both for hidden print area and visible preview) ──
function PrintFormContent({
  f,
  registrationNo,
  sigPreview,
  photoPreview,
  appDate,
  maskMobile,
  maskAadhaar,
  maskEmail,
  fmtDob,
  isCBSE,
}: {
  f: FormState;
  registrationNo: string;
  sigPreview: string | null;
  photoPreview: string | null;
  appDate: string;
  maskMobile: (m: string) => string;
  maskAadhaar: (a: string) => string;
  maskEmail: (e: string) => string;
  fmtDob: (d: string) => string;
  isCBSE: boolean;
}) {
  const tdStyle: React.CSSProperties = {
    border: "1px solid #000",
    padding: "3px 5px",
    fontSize: 11,
    fontFamily: "serif",
  };
  const lblStyle: React.CSSProperties = {
    ...tdStyle,
    fontWeight: "bold",
    background: "#f0f0f0",
    width: "38%",
  };
  const hdrStyle: React.CSSProperties = {
    background: "#8b0000",
    color: "#fff",
    fontWeight: "bold",
    padding: "4px 8px",
    fontSize: 12,
    fontFamily: "serif",
    textAlign: "left",
    border: "1px solid #000",
  };
  const thStyle: React.CSSProperties = {
    border: "1px solid #000",
    background: "#e0e0e0",
    padding: "3px 5px",
    textAlign: "left",
    fontSize: 11,
    fontFamily: "serif",
  };

  const subjectRows = isCBSE
    ? ([
        ["Mathematics", f.mathMarks],
        ["Hindi - A / Hindi - B", f.hindiMarks],
        ["English Communicative / English Language & Literature", f.engMarks],
        ["Science", f.sciMarks],
        ["Social Science", f.ssMarks],
        ["CGPA (As entered by candidate)", f.cgpa],
      ] as [string, string][])
    : ([
        ["Mathematics", f.mathMarks],
        ["Hindi", f.hindiMarks],
        ["English", f.engMarks],
        ["Science", f.sciMarks],
        ["Social Science", f.ssMarks],
      ] as [string, string][]);

  return (
    <>
      {/* Header */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000",
          marginBottom: 0,
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                width: "14%",
                textAlign: "center",
                border: "1px solid #000",
                padding: "6px 4px",
                verticalAlign: "middle",
              }}
            >
              <div
                style={{ fontSize: 9, fontWeight: "bold", fontFamily: "serif" }}
              >
                India Post
              </div>
              <div style={{ fontSize: 18, lineHeight: 1 }}>🏛️</div>
              <div style={{ fontSize: 7, fontFamily: "serif" }}>भारत डाक</div>
            </td>
            <td
              style={{
                width: "72%",
                textAlign: "center",
                border: "1px solid #000",
                padding: "8px 6px",
                verticalAlign: "middle",
              }}
            >
              <div
                style={{ fontSize: 10, fontFamily: "serif", marginBottom: 2 }}
              >
                Department of Posts, Ministry of Communications, Government of
                India
              </div>
              <div
                className="print-header-title"
                style={{ fontFamily: "serif" }}
              >
                ONLINE GRAMIN DAK SEVAK ENGAGEMENT
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  fontFamily: "serif",
                  marginTop: 2,
                }}
              >
                Candidate Application Form
              </div>
            </td>
            <td
              className="print-photo-box"
              style={{
                width: "14%",
                textAlign: "center",
                border: "1px solid #000",
                padding: "4px",
                verticalAlign: "middle",
              }}
            >
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Candidate passport"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <span
                  style={{ fontSize: 9, fontFamily: "serif", color: "#555" }}
                >
                  Affix
                  <br />
                  Passport
                  <br />
                  Photo
                </span>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Personal Details */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", borderTop: "none" }}
      >
        <tbody>
          <tr>
            <td colSpan={2} style={hdrStyle}>
              Personal Details
            </td>
          </tr>
          <tr>
            <td style={lblStyle}>Registration Number</td>
            <td style={{ ...tdStyle, fontWeight: "bold" }}>{registrationNo}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Name</td>
            <td style={tdStyle}>{f.name || ""}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Father's / Mother's Name</td>
            <td style={tdStyle}>{f.fatherName || ""}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Mobile Number</td>
            <td style={tdStyle}>{maskMobile(f.mobile)}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Aadhaar Number</td>
            <td style={tdStyle}>{maskAadhaar(f.aadhaar)}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Email ID</td>
            <td style={tdStyle}>{maskEmail(f.email)}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Date of Birth</td>
            <td style={tdStyle}>{fmtDob(f.dob)}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Age (as on 05-01-2025)</td>
            <td style={tdStyle}>{calcAge(f.dob)}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Gender</td>
            <td style={tdStyle}>{f.gender || ""}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Category</td>
            <td style={tdStyle}>{f.category || ""}</td>
          </tr>
          <tr>
            <td style={lblStyle}>PH (Physically Handicapped)</td>
            <td style={tdStyle}>{f.ph ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Can you ride a bicycle?</td>
            <td style={tdStyle}>{f.bicycle || "—"}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Whether Employed</td>
            <td style={tdStyle}>{f.employed || "—"}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Employer NOC Available</td>
            <td style={tdStyle}>{f.noc || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Address Details */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", borderTop: "none" }}
      >
        <tbody>
          <tr>
            <td colSpan={4} style={hdrStyle}>
              Address Details
            </td>
          </tr>
          <tr>
            <td
              colSpan={2}
              style={{
                border: "1px solid #000",
                fontWeight: "bold",
                background: "#e0e0e0",
                textAlign: "center",
                padding: "3px 6px",
                fontSize: 11,
                width: "50%",
                fontFamily: "serif",
              }}
            >
              Present Address
            </td>
            <td
              colSpan={2}
              style={{
                border: "1px solid #000",
                fontWeight: "bold",
                background: "#e0e0e0",
                textAlign: "center",
                padding: "3px 6px",
                fontSize: 11,
                width: "50%",
                fontFamily: "serif",
              }}
            >
              Permanent Address
            </td>
          </tr>
          <tr>
            <td style={{ ...lblStyle, width: "24%" }}>Door No. / Street</td>
            <td style={{ ...tdStyle, width: "26%" }}>{f.pDoor || ""}</td>
            <td style={{ ...lblStyle, width: "24%" }}>Door No. / Street</td>
            <td style={{ ...tdStyle, width: "26%" }}>
              {f.sameAddr ? f.pDoor : f.perDoor}
            </td>
          </tr>
          <tr>
            <td style={lblStyle}>Village / City</td>
            <td style={tdStyle}>{f.pVillage || ""}</td>
            <td style={lblStyle}>Village / City</td>
            <td style={tdStyle}>{f.sameAddr ? f.pVillage : f.perVillage}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Panchayat / District</td>
            <td style={tdStyle}>{f.pPanchayat || ""}</td>
            <td style={lblStyle}>Panchayat / District</td>
            <td style={tdStyle}>
              {f.sameAddr ? f.pPanchayat : f.perPanchayat}
            </td>
          </tr>
          <tr>
            <td style={lblStyle}>Pin Code</td>
            <td style={tdStyle}>{f.pPin || ""}</td>
            <td style={lblStyle}>Pin Code</td>
            <td style={tdStyle}>{f.sameAddr ? f.pPin : f.perPin}</td>
          </tr>
        </tbody>
      </table>

      <div className="print-page-break" style={{ pageBreakBefore: "always" }} />

      {/* Marks */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td colSpan={4} style={hdrStyle}>
              {isCBSE
                ? "Subjects (CBSE) — Marks / Grades / Points"
                : "Marks / Grades / Points"}
            </td>
          </tr>
          <tr>
            <td style={{ ...lblStyle, width: "24%" }}>
              State &amp; Year of Passing
            </td>
            <td style={{ ...tdStyle, width: "26%" }}>{f.stateYear || ""}</td>
            <td style={{ ...lblStyle, width: "24%" }}>Board Name</td>
            <td style={{ ...tdStyle, width: "26%" }}>{f.board || ""}</td>
          </tr>
          <tr>
            <td style={lblStyle}>Result Type</td>
            <td style={tdStyle}>{f.resultType || ""}</td>
            <td style={lblStyle}>Board Remarks</td>
            <td style={tdStyle}>{f.boardRemarks || ""}</td>
          </tr>
        </tbody>
      </table>
      <table
        style={{ width: "100%", borderCollapse: "collapse", borderTop: "none" }}
      >
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "60%" }}>Subject</th>
            <th style={thStyle}>Marks / Grades / Points</th>
          </tr>
        </thead>
        <tbody>
          {subjectRows.map(([sub, val]) => (
            <tr key={sub}>
              <td style={tdStyle}>{sub}</td>
              <td style={tdStyle}>{val || ""}</td>
            </tr>
          ))}
          {!isCBSE && (
            <tr>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: "bold",
                  background: "#f0f0f0",
                }}
              >
                {f.resultType === "Percentage"
                  ? "Percentage Obtained"
                  : f.resultType === "CGPA"
                    ? "Total CGPA"
                    : "Total Grade / Point"}
              </td>
              <td style={{ ...tdStyle, fontWeight: "bold" }}>
                {f.resultType === "Percentage"
                  ? f.pctObtained
                  : f.resultType === "CGPA"
                    ? f.cgpa
                    : f.totalGrade}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Declarations */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderTop: "none",
          marginTop: 6,
        }}
      >
        <tbody>
          <tr>
            <td style={hdrStyle}>Declarations</td>
          </tr>
          <tr>
            <td style={{ border: "1px solid #000", padding: "5px 7px" }}>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: 11,
                  fontFamily: "serif",
                  lineHeight: 1.7,
                }}
              >
                {DECLARATIONS.map((decl) => (
                  <li key={decl.slice(0, 40)} style={{ marginBottom: 3 }}>
                    <span style={{ marginRight: 4 }}>☑</span>
                    {decl}
                  </li>
                ))}
              </ol>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="print-page-break" style={{ pageBreakBefore: "always" }} />

      {/* Signature row */}
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginBottom: 8 }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "6px 8px",
                width: "60%",
                verticalAlign: "middle",
                fontSize: 11,
                fontFamily: "serif",
              }}
            >
              <strong>Date:</strong> {appDate}
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "40%",
                textAlign: "center",
                verticalAlign: "top",
              }}
            >
              <div
                className="print-sig-box"
                style={{
                  margin: "0 auto 2px auto",
                  overflow: "hidden",
                  width: 150,
                  height: 55,
                  border: "1px solid #000",
                }}
              >
                {sigPreview ? (
                  <img
                    src={sigPreview}
                    alt="Candidate signature"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span
                    style={{ fontSize: 9, fontFamily: "serif", color: "#999" }}
                  >
                    &nbsp;
                  </span>
                )}
              </div>
              <div style={{ fontSize: 10, fontFamily: "serif", marginTop: 2 }}>
                Candidate's Signature
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Annexure */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td
              colSpan={5}
              style={{
                border: "1px solid #000",
                padding: "4px 8px",
                fontWeight: "bold",
                fontSize: 12,
                fontFamily: "serif",
                background: "#fff",
              }}
            >
              Annexure
            </td>
          </tr>
          <tr>
            <td
              colSpan={5}
              style={{
                border: "1px solid #000",
                padding: "3px 8px",
                fontSize: 11,
                fontFamily: "serif",
              }}
            >
              Posts applied for Madhya Pradesh, {f.division || "___________"}{" "}
              &nbsp;&nbsp; Preference order:
            </td>
          </tr>
          {f.preferences.length > 0 ? (
            <>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    background: "#e0e0e0",
                    width: "8%",
                    textAlign: "center",
                    fontSize: 11,
                    fontFamily: "serif",
                  }}
                >
                  Pref.
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "3px 5px",
                    background: "#e0e0e0",
                    fontSize: 11,
                    fontFamily: "serif",
                  }}
                >
                  Post Name (Branch Office — Post Type — Category — Amount)
                </th>
              </tr>
              {f.preferences.map((p, idx) => (
                <tr key={p.id}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 5px",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 11,
                      fontFamily: "serif",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "3px 5px",
                      fontSize: 11,
                      fontFamily: "serif",
                    }}
                  >
                    {p.boName} — GDS {p.postType} — {p.category} — Rs.
                    {p.basicPay.toLocaleString()}/-
                  </td>
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #000",
                  padding: "5px 8px",
                  textAlign: "center",
                  fontStyle: "italic",
                  fontSize: 11,
                  fontFamily: "serif",
                }}
              >
                No preferences added
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          borderTop: "none",
          marginTop: 0,
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 8px",
                fontSize: 11,
                fontFamily: "serif",
              }}
            >
              <strong>
                Division selected for document verification is{" "}
                {f.division || "___________"} (Madhya Pradesh)
              </strong>
            </td>
          </tr>
        </tbody>
      </table>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
      >
        <tbody>
          <tr>
            <td style={{ border: "none", width: "60%" }}>&nbsp;</td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "40%",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 150,
                  height: 55,
                  border: "1px solid #000",
                  margin: "0 auto 2px auto",
                }}
              >
                &nbsp;
              </div>
              <div style={{ fontSize: 10, fontFamily: "serif", marginTop: 2 }}>
                Authorized Signature
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterCandidate() {
  const [registrationNo, setRegistrationNo] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [sigPreview, setSigPreview] = useState<string | null>(null);
  const [sigFileName, setSigFileName] = useState<string>("");
  const [saved, setSaved] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [validErrs, setValidErrs] = useState<Record<string, string>>({});
  const photoRef = useRef<HTMLInputElement>(null);
  const sigFileRef = useRef<HTMLInputElement>(null);

  const { mutate, isPending } = useAdminAddCandidate();
  const { data: activeVacanciesData } = useActiveVacancies();
  const availVacancies = activeVacanciesData ?? getAvailableVacancies();
  const anyVac = availVacancies.length > 0;

  const appDate = new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const [f, setF] = useState<FormState>({
    name: "",
    fatherName: "",
    motherName: "",
    mobile: "",
    aadhaar: "",
    email: "",
    dob: "",
    gender: "",
    category: "",
    ph: false,
    bicycle: "",
    employed: "",
    noc: "",
    pDoor: "",
    pVillage: "",
    pPanchayat: "",
    pPin: "",
    perDoor: "",
    perVillage: "",
    perPanchayat: "",
    perPin: "",
    sameAddr: false,
    stateYear: "",
    board: "",
    resultType: "Percentage",
    boardRemarks: "",
    mathMarks: "",
    hindiMarks: "",
    engMarks: "",
    sciMarks: "",
    ssMarks: "",
    cgpa: "",
    pctObtained: "",
    totalGrade: "",
    doc10th: null,
    docPhoto: null,
    docId: null,
    docCommunity: null,
    docDisability: null,
    docEWS: null,
    preferences: [],
    division: "",
    declarations: Array(9).fill(false),
    appDate,
  });

  const isCBSE = f.board === CBSE_BOARD;

  useEffect(() => {
    if (f.sameAddr)
      setF((p) => ({
        ...p,
        perDoor: p.pDoor,
        perVillage: p.pVillage,
        perPanchayat: p.pPanchayat,
        perPin: p.pPin,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.sameAddr]);

  function upd<K extends keyof FormState>(k: K, v: FormState[K]) {
    setF((p) => ({ ...p, [k]: v }));
    setValidErrs((e) => ({ ...e, [k]: "" }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    upd("docPhoto", file);
    const r = new FileReader();
    r.onload = (ev) => setPhotoPreview((ev.target?.result as string) ?? null);
    r.readAsDataURL(file);
  }

  function handleSigFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSigFileName(file.name);
    const r = new FileReader();
    r.onload = (ev) => {
      const d = (ev.target?.result as string) ?? null;
      setSigPreview(d);
    };
    r.readAsDataURL(file);
  }

  const divVac = anyVac
    ? availVacancies.filter(
        (v) => v.division.toLowerCase() === f.division.toLowerCase(),
      )
    : (
        MP_POSTAL_DIVISIONS.find((d) => d.name === f.division)?.branchOffices ??
        []
      ).flatMap((bo) =>
        (["BPM", "ABPM"] as const).flatMap((pt) =>
          CATEGORIES.map((cat) => ({
            branchOfficeName: bo.name,
            postType: pt,
            category: cat,
            basicPay: pt === "BPM" ? 12000 : 10000,
          })),
        ),
      );

  function addPref(key: string) {
    if (!key || f.preferences.length >= 5) return;
    const [boName, postType, category] = key.split("||") as [
      string,
      "BPM" | "ABPM",
      string,
    ];
    const basicPay = postType === "BPM" ? 12000 : 10000;
    setF((p) => ({
      ...p,
      preferences: [
        ...p.preferences,
        { id: `${Date.now()}`, boName, postType, category, basicPay },
      ],
    }));
  }
  function removePref(id: string) {
    setF((p) => ({
      ...p,
      preferences: p.preferences.filter((x) => x.id !== id),
    }));
  }
  function toggleDecl(i: number) {
    setF((p) => {
      const d = [...p.declarations];
      d[i] = !d[i];
      return { ...p, declarations: d };
    });
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!f.name.trim()) errs.name = "Required";
    if (!f.fatherName.trim()) errs.fatherName = "Required";
    if (!f.dob) errs.dob = "Required";
    if (!f.gender) errs.gender = "Required";
    if (!f.category) errs.category = "Required";
    if (!/^\d{10}$/.test(f.mobile)) errs.mobile = "Must be 10 digits";
    if (f.aadhaar && !/^\d{12}$/.test(f.aadhaar.replace(/\s/g, "")))
      errs.aadhaar = "Must be 12 digits";
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      errs.email = "Invalid email";
    if (!f.pDoor.trim()) errs.pDoor = "Required";
    if (!registrationNo.trim())
      errs.registrationNo = "Registration number required";
    else if (!/^[A-Za-z0-9-]{1,20}$/.test(registrationNo))
      errs.registrationNo = "Only letters, numbers and hyphens (max 20 chars)";
    if (!f.division) errs.division = "Required";
    if (!f.declarations.every(Boolean))
      errs.declarations = "All declarations must be accepted";
    if (!f.doc10th) errs.doc10th = "Required";
    if (!f.docId) errs.docId = "Required";
    if (!f.docCommunity) errs.docCommunity = "Required";
    if (!sigPreview) errs.signature = "Signature upload is required";
    setValidErrs(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const marksVal =
      f.resultType === "Percentage"
        ? f.pctObtained
        : f.resultType === "CGPA"
          ? f.cgpa
          : f.totalGrade;
    const subjectMarks = [
      { subject: "Mathematics", marksOrGrade: f.mathMarks },
      {
        subject: isCBSE ? "Hindi - A / Hindi - B" : "Hindi",
        marksOrGrade: f.hindiMarks,
      },
      {
        subject: isCBSE
          ? "English Communicative / English Language & Literature"
          : "English",
        marksOrGrade: f.engMarks,
      },
      { subject: "Science", marksOrGrade: f.sciMarks },
      { subject: "Social Science", marksOrGrade: f.ssMarks },
    ].filter((sm) => sm.marksOrGrade.trim());

    const postPreferences: AdminCandidatePostPreference[] = f.preferences.map(
      (p, i) => ({
        preferenceNo: i + 1,
        branchOfficeName: p.boName,
        postType: p.postType,
        category: p.category,
        basicPay: p.basicPay,
      }),
    );
    const [stateOfBoard, yearOfPassing] = f.stateYear.includes(",")
      ? f.stateYear.split(",").map((s) => s.trim())
      : [f.stateYear, ""];

    mutate(
      {
        name: f.name,
        fatherName: f.fatherName,
        dob: f.dob,
        category: f.category,
        mobile: f.mobile,
        email: f.email,
        aadhaar: f.aadhaar,
        gender: f.gender,
        ph: f.ph,
        canRideBicycle: f.bicycle === "Yes",
        isEmployed: f.employed === "Yes",
        nocAvailable: f.noc === "Yes",
        circle: "Madhya Pradesh",
        division: f.division,
        overrideRegistrationNo: registrationNo || undefined,
        presentAddress: {
          doorNo: f.pDoor,
          street: f.pDoor,
          village: f.pVillage,
          district: f.pPanchayat,
          state: "Madhya Pradesh",
          pincode: f.pPin,
        },
        permanentAddress: {
          doorNo: f.sameAddr ? f.pDoor : f.perDoor,
          street: f.sameAddr ? f.pDoor : f.perDoor,
          village: f.sameAddr ? f.pVillage : f.perVillage,
          district: f.sameAddr ? f.pPanchayat : f.perPanchayat,
          state: "Madhya Pradesh",
          pincode: f.sameAddr ? f.pPin : f.perPin,
        },
        boardName: f.board,
        stateOfBoard,
        yearOfPassing,
        resultType: f.resultType,
        subjectMarks,
        totalCgpa: f.cgpa,
        totalGrade: f.totalGrade,
        percentageObtained: f.pctObtained || marksVal,
        boardRemarks: f.boardRemarks,
        declarationsAccepted: f.declarations.every(Boolean),
        postPreferences,
        divisionForVerification: f.division,
        photoPath: photoPreview ?? "",
        signaturePath: sigPreview ?? "",
      },
      {
        onSuccess: (savedCandidate) => {
          // Auto-save application form data to localStorage for candidate portal
          const finalRegNo =
            savedCandidate &&
            typeof savedCandidate === "object" &&
            "registrationNo" in savedCandidate
              ? (savedCandidate as { registrationNo: string }).registrationNo
              : registrationNo;
          const formDataPayload = {
            name: f.name,
            registrationNo: finalRegNo,
            fatherName: f.fatherName,
            dob: f.dob,
            gender: f.gender,
            category: f.category,
            mobile: f.mobile,
            email: f.email,
            circle: "Madhya Pradesh",
            division: f.division,
            boardName: f.board,
            stateYear: f.stateYear,
            resultType: f.resultType,
            percentageObtained: f.pctObtained,
            totalCgpa: f.cgpa,
            totalGrade: f.totalGrade,
            boardRemarks: f.boardRemarks,
            subjectMarks: subjectMarks,
            postPreferences: postPreferences.map((pp) => ({
              preferenceNo: pp.preferenceNo,
              branchOfficeName: pp.branchOfficeName,
              postType: pp.postType,
              category: pp.category,
              basicPay: pp.basicPay,
            })),
            divisionForVerification: f.division,
            appDate,
          };
          try {
            localStorage.setItem(
              `appFormData_${finalRegNo}`,
              JSON.stringify(formDataPayload),
            );
          } catch {
            /* ignore */
          }
          setSaved(true);
          setShowPreview(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
      },
    );
  }

  function maskMobile(m: string) {
    if (!m || m.length < 4) return m;
    return `${m.slice(0, 2)}${"X".repeat(m.length - 2)}`;
  }
  function maskAadhaar(a: string) {
    if (!a || a.length < 4) return a;
    return `XXXX XXXX ${a.slice(-4)}`;
  }
  function maskEmail(e: string) {
    if (!e || !e.includes("@")) return e;
    const [l, d] = e.split("@");
    return `${l.slice(0, 2)}***@${d}`;
  }
  function fmtDob(d: string) {
    if (!d) return "";
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  }

  const inputCls =
    "w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-card text-foreground";
  const selectCls =
    "w-full border border-input rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-card text-foreground";
  const lastColLabel =
    f.resultType === "Percentage"
      ? "Percentage Obtained"
      : f.resultType === "CGPA"
        ? "Total CGPA"
        : "Total Grade/Point";

  const printContentProps = {
    f,
    registrationNo,
    sigPreview,
    photoPreview,
    appDate,
    maskMobile,
    maskAadhaar,
    maskEmail,
    fmtDob,
    isCBSE,
  };

  // ─── Final Preview ─────────────────────────────────────────────────────────
  if (showPreview) {
    // Ensure printable area is shown inline on preview page (not hidden)
    const previewPrintCss = PRINT_CSS.replace(
      "#gds-printable-area { display: none; }",
      "",
    );
    return (
      <>
        <style>{previewPrintCss}</style>
        {/* Action buttons (hidden on print) */}
        <div
          className="preview-action-buttons flex flex-wrap gap-3 mb-6 p-4 bg-card border border-border rounded-xl shadow-sm"
          data-ocid="rc-preview-actions"
        >
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground">
              Application Preview — Reg. No.:{" "}
              <span className="text-blue-700">{registrationNo}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Review the form below. Use Download as PDF or Print Form to save a
              copy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="button"
              onClick={() => window.print()}
              data-ocid="rc-download-pdf-btn"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              ⬇ Download as PDF
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              data-ocid="rc-print-form-btn"
              className="bg-foreground/80 hover:bg-foreground text-background font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              🖨️ Print Form
            </button>
            <button
              type="button"
              data-ocid="rc-back-to-form-btn"
              onClick={() => {
                setShowPreview(false);
                setSaved(false);
                setRegistrationNo("");
                setSigPreview(null);
                setSigFileName("");
                setPhotoPreview(null);
                setF((prev) => ({
                  ...prev,
                  name: "",
                  fatherName: "",
                  mobile: "",
                  aadhaar: "",
                  email: "",
                  dob: "",
                  gender: "",
                  category: "",
                  ph: false,
                  bicycle: "",
                  employed: "",
                  noc: "",
                  pDoor: "",
                  pVillage: "",
                  pPanchayat: "",
                  pPin: "",
                  perDoor: "",
                  perVillage: "",
                  perPanchayat: "",
                  perPin: "",
                  sameAddr: false,
                  stateYear: "",
                  board: "",
                  resultType: "Percentage",
                  boardRemarks: "",
                  mathMarks: "",
                  hindiMarks: "",
                  engMarks: "",
                  sciMarks: "",
                  ssMarks: "",
                  cgpa: "",
                  pctObtained: "",
                  totalGrade: "",
                  doc10th: null,
                  docPhoto: null,
                  docId: null,
                  docCommunity: null,
                  docDisability: null,
                  docEWS: null,
                  preferences: [],
                  division: "",
                  declarations: Array(9).fill(false),
                }));
              }}
              className="bg-green-700 hover:bg-green-800 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              + Register Another
            </button>
          </div>
        </div>

        {/* Visible preview area (also used for printing) */}
        <div
          id="gds-printable-area"
          style={{
            display: "block",
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: 11,
            color: "#000",
            background: "#fff",
            maxWidth: 794,
            margin: "0 auto",
            padding: "12px 10px",
          }}
        >
          <PrintFormContent {...printContentProps} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{PRINT_CSS}</style>

      {/* Hidden print area (for direct print without preview) */}
      <div id="gds-printable-area">
        <PrintFormContent {...printContentProps} />
      </div>

      {/* ─── Screen Form ─────────────────────────────────────────────────────── */}
      <div className="w-full min-w-0 pb-10" data-ocid="register-candidate-page">
        {/* Page Title */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Register New Candidate
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Fill in all details below and click Save to register the
              candidate.
            </p>
          </div>
          {saved && (
            <div className="bg-green-50 border border-green-400 text-green-800 rounded-lg px-4 py-2 text-sm font-medium">
              ✓ Registered! Reg. No.: <strong>{registrationNo}</strong>
            </div>
          )}
        </div>

        {Object.keys(validErrs).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-300 text-red-700 rounded-lg px-4 py-3 text-sm">
            ⚠ Please fix the errors highlighted below before saving.
          </div>
        )}

        <form onSubmit={handleSave} noValidate>
          {/* ── SECTION 1: PERSONAL DETAILS ── */}
          <SectionCard title="Personal Details" icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <Label required htmlFor="rc-reg-no">
                  Registration Number
                </Label>
                <input
                  id="rc-reg-no"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-card font-mono font-bold text-blue-700 ${validErrs.registrationNo ? "border-red-400" : "border-input"}`}
                  value={registrationNo}
                  onChange={(e) => {
                    const v = e.target.value
                      .replace(/[^A-Za-z0-9-]/g, "")
                      .slice(0, 20);
                    setRegistrationNo(v);
                    setValidErrs((err) => ({ ...err, registrationNo: "" }));
                  }}
                  placeholder="Enter Registration No. (max 20 chars)"
                  maxLength={20}
                  data-ocid="rc-reg-no"
                />
                <div className="flex justify-between mt-1">
                  {validErrs.registrationNo ? (
                    <p className="text-red-500 text-xs">
                      {validErrs.registrationNo}
                    </p>
                  ) : (
                    <span />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {registrationNo.length}/20 characters
                  </span>
                </div>
              </div>
              <InputField label="Name" required error={validErrs.name}>
                <input
                  className={inputCls}
                  value={f.name}
                  onChange={(e) => upd("name", e.target.value)}
                  placeholder="Full name as per documents"
                  data-ocid="rc-name"
                />
              </InputField>
              <InputField
                label="Father's / Mother's Name"
                required
                error={validErrs.fatherName}
              >
                <input
                  className={inputCls}
                  value={f.fatherName}
                  onChange={(e) => upd("fatherName", e.target.value)}
                  data-ocid="rc-father"
                />
              </InputField>
              <InputField
                label="Mobile Number"
                required
                error={validErrs.mobile}
              >
                <input
                  className={inputCls}
                  value={f.mobile}
                  onChange={(e) =>
                    upd(
                      "mobile",
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    )
                  }
                  maxLength={10}
                  placeholder="10-digit mobile"
                  data-ocid="rc-mobile"
                />
              </InputField>
              <InputField label="Aadhaar Number" error={validErrs.aadhaar}>
                <input
                  className={inputCls}
                  value={f.aadhaar}
                  onChange={(e) =>
                    upd(
                      "aadhaar",
                      e.target.value.replace(/\D/g, "").slice(0, 12),
                    )
                  }
                  maxLength={12}
                  placeholder="12-digit Aadhaar"
                  data-ocid="rc-aadhaar"
                />
              </InputField>
              <InputField label="Email ID" error={validErrs.email}>
                <input
                  className={inputCls}
                  type="email"
                  value={f.email}
                  onChange={(e) => upd("email", e.target.value)}
                  placeholder="candidate@email.com"
                  data-ocid="rc-email"
                />
              </InputField>
              <InputField label="Date of Birth" required error={validErrs.dob}>
                <input
                  className={inputCls}
                  type="date"
                  value={f.dob}
                  onChange={(e) => upd("dob", e.target.value)}
                  data-ocid="rc-dob"
                />
                {f.dob && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Age: {calcAge(f.dob)}
                  </p>
                )}
              </InputField>
              <InputField label="Category" required error={validErrs.category}>
                <select
                  className={selectCls}
                  value={f.category}
                  onChange={(e) => upd("category", e.target.value)}
                  data-ocid="rc-category"
                >
                  <option value="">-- Select Category --</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </InputField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <InputField label="Gender" required error={validErrs.gender}>
                <div className="flex gap-5 mt-1">
                  {["Male", "Female", "Other"].map((g) => (
                    <label
                      key={g}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        name="rc-gender"
                        value={g}
                        checked={f.gender === g}
                        onChange={() => upd("gender", g)}
                        className="accent-blue-600"
                        data-ocid={`rc-gender-${g.toLowerCase()}`}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </InputField>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={f.ph}
                    onChange={(e) => upd("ph", e.target.checked)}
                    className="accent-blue-600 w-4 h-4"
                    data-ocid="rc-ph"
                  />
                  <span>Physically Handicapped (PH)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <InputField label="Can you ride a bicycle?">
                <div className="flex gap-5 mt-1">
                  {["Yes", "No"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        name="rc-bicycle"
                        value={v}
                        checked={f.bicycle === v}
                        onChange={() => upd("bicycle", v)}
                        className="accent-blue-600"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </InputField>
              <InputField label="Whether Employed?">
                <div className="flex gap-5 mt-1">
                  {["Yes", "No"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        name="rc-employed"
                        value={v}
                        checked={f.employed === v}
                        onChange={() => upd("employed", v)}
                        className="accent-blue-600"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </InputField>
              <InputField label="Employer NOC Available?">
                <div className="flex gap-5 mt-1">
                  {["Yes", "No"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                    >
                      <input
                        type="radio"
                        name="rc-noc"
                        value={v}
                        checked={f.noc === v}
                        onChange={() => upd("noc", v)}
                        className="accent-blue-600"
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </InputField>
            </div>
          </SectionCard>

          {/* ── SECTION 2: PHOTO & SIGNATURE UPLOAD ── */}
          <SectionCard title="Photo & Signature Upload" icon="📷">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label required>Passport Photograph</Label>
                <div className="flex items-start gap-4">
                  <button
                    type="button"
                    className="w-24 h-28 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted/20 flex-shrink-0 cursor-pointer"
                    onClick={() => photoRef.current?.click()}
                    aria-label="Upload passport photograph"
                  >
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Candidate passport"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground text-center px-1">
                        Click to upload
                      </span>
                    )}
                  </button>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => photoRef.current?.click()}
                      className="flex items-center gap-2 border border-primary/40 text-primary rounded-lg px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
                      data-ocid="rc-photo-upload"
                    >
                      📁 Choose Photo
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG/PNG, max 2MB. Recent passport size.
                    </p>
                    {f.docPhoto && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {f.docPhoto.name}
                      </p>
                    )}
                    <input
                      ref={photoRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handlePhoto}
                    />
                  </div>
                </div>
              </div>

              {/* Signature Upload Only */}
              <div>
                <Label required>Signature (Upload Image)</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Upload a clear image of your signature (JPG/PNG only)
                </p>
                <div className="flex items-start gap-4">
                  {sigPreview ? (
                    <div className="w-36 h-16 border border-border rounded-lg overflow-hidden bg-card flex-shrink-0">
                      <img
                        src={sigPreview}
                        alt="Signature preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-36 h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20 flex-shrink-0">
                      <span className="text-xs text-muted-foreground text-center px-2">
                        Signature preview
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => sigFileRef.current?.click()}
                      className="flex items-center gap-2 border border-primary/40 text-primary rounded-lg px-4 py-2 text-sm hover:bg-primary/5 transition-colors"
                      data-ocid="rc-sig-upload"
                    >
                      📁 Upload Signature
                    </button>
                    <p className="text-xs text-muted-foreground mt-2">
                      {sigFileName ? `✓ ${sigFileName}` : "No file chosen"}
                    </p>
                    <input
                      ref={sigFileRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleSigFile}
                    />
                    {validErrs.signature && (
                      <p className="text-red-500 text-xs mt-1">
                        {validErrs.signature}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── SECTION 3: ADDRESS DETAILS ── */}
          <SectionCard title="Address Details" icon="🏠">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground text-sm mb-3 pb-2 border-b border-border">
                  Present Address
                </h3>
                <div className="space-y-4">
                  <InputField
                    label="Door No. / Street"
                    required
                    error={validErrs.pDoor}
                  >
                    <input
                      className={inputCls}
                      value={f.pDoor}
                      onChange={(e) => upd("pDoor", e.target.value)}
                      data-ocid="rc-p-door"
                    />
                  </InputField>
                  <InputField label="Village / City">
                    <input
                      className={inputCls}
                      value={f.pVillage}
                      onChange={(e) => upd("pVillage", e.target.value)}
                    />
                  </InputField>
                  <InputField label="Panchayat / District">
                    <input
                      className={inputCls}
                      value={f.pPanchayat}
                      onChange={(e) => upd("pPanchayat", e.target.value)}
                    />
                  </InputField>
                  <InputField label="Pin Code">
                    <input
                      className={inputCls}
                      value={f.pPin}
                      onChange={(e) =>
                        upd(
                          "pPin",
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      maxLength={6}
                      placeholder="6-digit PIN"
                    />
                  </InputField>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <h3 className="font-semibold text-foreground text-sm">
                    Permanent Address
                  </h3>
                  <label className="flex items-center gap-2 text-xs cursor-pointer text-red-600">
                    <input
                      type="checkbox"
                      checked={f.sameAddr}
                      onChange={(e) => upd("sameAddr", e.target.checked)}
                      className="accent-red-600"
                      data-ocid="rc-same-addr"
                    />
                    Same as Present
                  </label>
                </div>
                <div className="space-y-4">
                  <InputField label="Door No. / Street">
                    <input
                      className={`${inputCls} ${f.sameAddr ? "bg-muted/50" : ""}`}
                      value={f.sameAddr ? f.pDoor : f.perDoor}
                      onChange={(e) =>
                        !f.sameAddr && upd("perDoor", e.target.value)
                      }
                      disabled={f.sameAddr}
                    />
                  </InputField>
                  <InputField label="Village / City">
                    <input
                      className={`${inputCls} ${f.sameAddr ? "bg-muted/50" : ""}`}
                      value={f.sameAddr ? f.pVillage : f.perVillage}
                      onChange={(e) =>
                        !f.sameAddr && upd("perVillage", e.target.value)
                      }
                      disabled={f.sameAddr}
                    />
                  </InputField>
                  <InputField label="Panchayat / District">
                    <input
                      className={`${inputCls} ${f.sameAddr ? "bg-muted/50" : ""}`}
                      value={f.sameAddr ? f.pPanchayat : f.perPanchayat}
                      onChange={(e) =>
                        !f.sameAddr && upd("perPanchayat", e.target.value)
                      }
                      disabled={f.sameAddr}
                    />
                  </InputField>
                  <InputField label="Pin Code">
                    <input
                      className={`${inputCls} ${f.sameAddr ? "bg-muted/50" : ""}`}
                      value={f.sameAddr ? f.pPin : f.perPin}
                      onChange={(e) =>
                        !f.sameAddr &&
                        upd(
                          "perPin",
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      maxLength={6}
                      disabled={f.sameAddr}
                    />
                  </InputField>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ── SECTION 4: ACADEMIC DETAILS ── */}
          <SectionCard title="Academic Details (10th Standard)" icon="🎓">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <InputField label="State & Year of Passing">
                <input
                  className={inputCls}
                  value={f.stateYear}
                  onChange={(e) => upd("stateYear", e.target.value)}
                  placeholder="e.g. Madhya Pradesh, 2022"
                />
              </InputField>
              <InputField label="Board Name">
                <select
                  className={selectCls}
                  value={f.board}
                  onChange={(e) => upd("board", e.target.value)}
                  data-ocid="rc-board"
                >
                  <option value="">-- Select Board --</option>
                  {BOARDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </InputField>
              <InputField label="Result Type" required>
                <div className="flex gap-5 mt-1">
                  {(["Percentage", "CGPA", "Grade/Point"] as ResultType[]).map(
                    (rt) => (
                      <label
                        key={rt}
                        className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                      >
                        <input
                          type="radio"
                          name="rc-result-type"
                          value={rt}
                          checked={f.resultType === rt}
                          onChange={() => upd("resultType", rt)}
                          className="accent-blue-600"
                          data-ocid={`rc-rt-${rt.toLowerCase()}`}
                        />
                        {rt}
                      </label>
                    ),
                  )}
                </div>
              </InputField>
              <InputField label="Board Remarks">
                <input
                  className={inputCls}
                  value={f.boardRemarks}
                  onChange={(e) => upd("boardRemarks", e.target.value)}
                  placeholder="Pass / Distinction / etc."
                />
              </InputField>
            </div>

            {/* CBSE subjects — shown only when CBSE board selected */}
            {isCBSE ? (
              <div className="bg-blue-50/60 rounded-lg border border-blue-200 overflow-hidden">
                <div className="bg-blue-700 px-4 py-2 grid grid-cols-2 gap-2">
                  <span className="text-xs font-semibold text-white uppercase">
                    Subject (CBSE)
                  </span>
                  <span className="text-xs font-semibold text-white uppercase">
                    Marks / Grades / Points
                  </span>
                </div>
                {(
                  [
                    ["1. Mathematics", "mathMarks"],
                    ["2. Hindi - A / Hindi - B", "hindiMarks"],
                    [
                      "3. English Communicative / English Language & Literature",
                      "engMarks",
                    ],
                    ["4. Science", "sciMarks"],
                    ["5. Social Science", "ssMarks"],
                  ] as [string, keyof FormState][]
                ).map(([sub, field]) => (
                  <div
                    key={sub}
                    className="px-4 py-2 grid grid-cols-2 gap-2 border-t border-blue-100"
                  >
                    <span className="text-sm text-foreground self-center leading-tight">
                      {sub}
                    </span>
                    <input
                      className={inputCls}
                      value={f[field] as string}
                      onChange={(e) =>
                        upd(field, e.target.value as FormState[typeof field])
                      }
                      placeholder="Enter marks"
                    />
                  </div>
                ))}
                <div className="px-4 py-2 grid grid-cols-2 gap-2 border-t border-blue-200 bg-blue-100/50">
                  <span className="text-sm font-semibold text-foreground self-center">
                    6. CGPA (As entered by candidate)
                  </span>
                  <input
                    className={inputCls}
                    value={f.cgpa}
                    onChange={(e) => upd("cgpa", e.target.value)}
                    placeholder="e.g. 8.5"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 grid grid-cols-2 gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Subject
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Marks / Grades / Points
                  </span>
                </div>
                {(
                  [
                    ["Mathematics", "mathMarks"],
                    ["Hindi", "hindiMarks"],
                    ["English", "engMarks"],
                    ["Science", "sciMarks"],
                    ["Social Science", "ssMarks"],
                  ] as [string, keyof FormState][]
                ).map(([sub, field]) => (
                  <div
                    key={sub}
                    className="px-4 py-2 grid grid-cols-2 gap-2 border-t border-border"
                  >
                    <span className="text-sm text-foreground self-center">
                      {sub}
                    </span>
                    <input
                      className={inputCls}
                      value={f[field] as string}
                      onChange={(e) =>
                        upd(field, e.target.value as FormState[typeof field])
                      }
                      placeholder="Enter marks"
                    />
                  </div>
                ))}
                <div className="px-4 py-2 grid grid-cols-2 gap-2 border-t border-border bg-primary/5">
                  <span className="text-sm font-semibold text-foreground self-center">
                    {lastColLabel}
                  </span>
                  {f.resultType === "Percentage" && (
                    <input
                      className={inputCls}
                      value={f.pctObtained}
                      onChange={(e) => upd("pctObtained", e.target.value)}
                      placeholder="e.g. 85.50"
                    />
                  )}
                  {f.resultType === "CGPA" && (
                    <input
                      className={inputCls}
                      value={f.cgpa}
                      onChange={(e) => upd("cgpa", e.target.value)}
                      placeholder="e.g. 8.5"
                    />
                  )}
                  {f.resultType === "Grade/Point" && (
                    <input
                      className={inputCls}
                      value={f.totalGrade}
                      onChange={(e) => upd("totalGrade", e.target.value)}
                      placeholder="e.g. A+ or 8.0"
                    />
                  )}
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── SECTION 5: POST PREFERENCES ── */}
          <SectionCard title="Post Preferences" icon="📍">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <InputField
                label="Select MP Division"
                required
                error={validErrs.division}
              >
                <select
                  className={selectCls}
                  value={f.division}
                  onChange={(e) => {
                    const v = e.target.value;
                    setF((p) => ({ ...p, division: v, preferences: [] }));
                    setValidErrs((er) => ({ ...er, division: "" }));
                  }}
                  data-ocid="rc-division-select"
                >
                  <option value="">-- Select Division --</option>
                  {MP_POSTAL_DIVISIONS.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </InputField>
              {f.division && f.preferences.length < 5 && (
                <InputField label="Add Branch Office Preference">
                  <select
                    id="rc-bo-add"
                    className={selectCls}
                    defaultValue=""
                    data-ocid="rc-bo-select"
                    onChange={(e) => {
                      if (e.target.value) {
                        addPref(e.target.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  >
                    <option value="">-- Select Branch Office --</option>
                    {divVac.map((v) => {
                      const key = `${v.branchOfficeName}||${v.postType}||${v.category}`;
                      return (
                        <option key={key} value={key}>
                          {v.branchOfficeName} — GDS {v.postType} — {v.category}{" "}
                          — Rs.{v.basicPay.toLocaleString()}/-
                        </option>
                      );
                    })}
                  </select>
                </InputField>
              )}
            </div>

            {f.preferences.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="bg-muted/40 px-4 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground uppercase">
                  <span className="col-span-1">Pref.</span>
                  <span className="col-span-4">Branch Office</span>
                  <span className="col-span-2">Post</span>
                  <span className="col-span-2">Category</span>
                  <span className="col-span-2">Basic Pay</span>
                  <span className="col-span-1" />
                </div>
                {f.preferences.map((p, idx) => (
                  <div
                    key={p.id}
                    className="px-4 py-2 grid grid-cols-12 gap-2 border-t border-border text-sm items-center"
                    data-ocid={`rc-pref.item.${idx + 1}`}
                  >
                    <span className="col-span-1 font-bold text-blue-700">
                      {idx + 1}
                    </span>
                    <span className="col-span-4 text-foreground">
                      {p.boName}
                    </span>
                    <span className="col-span-2">
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded">
                        GDS {p.postType}
                      </span>
                    </span>
                    <span className="col-span-2 text-muted-foreground">
                      {p.category}
                    </span>
                    <span className="col-span-2 text-foreground">
                      ₹{p.basicPay.toLocaleString()}/-
                    </span>
                    <button
                      type="button"
                      onClick={() => removePref(p.id)}
                      className="col-span-1 text-red-500 hover:text-red-700 text-xs font-bold"
                      data-ocid={`rc-remove-pref.${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="text-center text-muted-foreground text-sm py-6 border-2 border-dashed border-border rounded-lg"
                data-ocid="rc-prefs.empty_state"
              >
                No preferences added yet. Select a division and branch office
                above.
              </div>
            )}
            {f.preferences.length >= 5 && (
              <p className="text-xs text-amber-600 mt-2">
                Maximum 5 preferences reached.
              </p>
            )}
          </SectionCard>

          {/* ── SECTION 6: DIVISION FOR VERIFICATION ── */}
          <SectionCard title="Division for Document Verification" icon="🏢">
            <InputField
              label="Select Division"
              required
              error={validErrs.division}
            >
              <select
                className={selectCls}
                value={f.division}
                onChange={(e) => upd("division", e.target.value)}
                data-ocid="rc-verif-division"
              >
                <option value="">-- Select Division --</option>
                {MP_POSTAL_DIVISIONS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </InputField>
            {f.division && (
              <p className="text-sm text-blue-700 mt-2 font-medium">
                Selected: {f.division} (Madhya Pradesh)
              </p>
            )}
          </SectionCard>

          {/* ── SECTION 7: DOCUMENT UPLOADS ── */}
          <SectionCard title="Document Uploads" icon="📎">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  label: "10th Marks Memo",
                  field: "doc10th" as const,
                  req: true,
                },
                { label: "Photograph", field: "docPhoto" as const, req: true },
                { label: "Identity Proof", field: "docId" as const, req: true },
                {
                  label: "Community Certificate",
                  field: "docCommunity" as const,
                  req: true,
                },
                {
                  label: "Disability Certificate",
                  field: "docDisability" as const,
                  req: false,
                },
                {
                  label: "EWS Certificate",
                  field: "docEWS" as const,
                  req: false,
                },
              ].map(({ label, field, req }) => (
                <div
                  key={field}
                  className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-muted/20 hover:bg-card transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {label}
                      {req && <span className="text-destructive ml-1">*</span>}
                      {!req && (
                        <span className="text-muted-foreground text-xs ml-1 font-normal">
                          (Optional)
                        </span>
                      )}
                    </p>
                    {(f[field] as File | null) ? (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {(f[field] as File).name}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF / JPG / PNG — max 2MB
                      </p>
                    )}
                    {validErrs[field] && (
                      <p className="text-xs text-red-500 mt-1">
                        {validErrs[field]}
                      </p>
                    )}
                  </div>
                  <label className="mt-auto">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setF((p) => ({ ...p, [field]: file }));
                      }}
                      data-ocid={`rc-upload-${field}`}
                    />
                    <span className="cursor-pointer inline-flex items-center gap-1.5 border border-red-300 text-red-700 rounded-lg px-4 py-2 text-xs font-medium hover:bg-red-50 transition-colors w-full justify-center">
                      📎 Upload File
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── SECTION 8: DECLARATIONS ── */}
          <SectionCard title="Declarations" icon="✅">
            <div className="space-y-3">
              {DECLARATIONS.map((decl, i) => (
                <label
                  key={decl.slice(0, 30)}
                  className="flex items-start gap-3 cursor-pointer group"
                  data-ocid={`rc-decl-${i + 1}`}
                >
                  <input
                    type="checkbox"
                    id={`rc-decl-${i}`}
                    checked={f.declarations[i]}
                    onChange={() => toggleDecl(i)}
                    className="accent-blue-600 w-4 h-4 mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-foreground leading-relaxed group-hover:text-foreground">
                    <strong>{i + 1}.</strong> {decl}
                  </span>
                </label>
              ))}
              {validErrs.declarations && (
                <p className="text-red-500 text-xs mt-2">
                  ⚠ {validErrs.declarations}
                </p>
              )}
            </div>
          </SectionCard>

          {/* ── SECTION 9: DATE ── */}
          <SectionCard title="Application Date" icon="📅">
            <InputField label="Application Date & Time">
              <input
                className={`${inputCls} bg-muted/50 font-medium`}
                value={appDate}
                readOnly
              />
            </InputField>
          </SectionCard>

          {/* ── ACTION BUTTONS ── */}
          <div className="flex flex-wrap gap-3 pt-5 border-t border-border justify-end">
            <button
              type="submit"
              disabled={isPending}
              data-ocid="rc-save-btn"
              className="bg-red-700 hover:bg-red-800 text-white font-semibold px-7 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <span className="animate-spin">⟳</span> Saving...
                </>
              ) : (
                "💾 Save Application"
              )}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              data-ocid="rc-print-btn"
              className="bg-foreground/80 hover:bg-foreground text-background font-semibold px-7 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm"
            >
              🖨️ Print Application
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
