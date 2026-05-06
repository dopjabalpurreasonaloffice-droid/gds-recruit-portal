import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Printer, Receipt, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface SlipData {
  transactionDate: string;
  transactionStatus: string;
  objective: string;
  modeOfPayment: string;
  from: string;
  to: string;
  place: string;
  amount: string;
  amountInWords: string;
  paymentDoneBySignature: string | null;
  receivedBySignature: string | null;
}

const EMPTY_SLIP: SlipData = {
  transactionDate: "",
  transactionStatus: "",
  objective: "",
  modeOfPayment: "",
  from: "",
  to: "",
  place: "",
  amount: "",
  amountInWords: "",
  paymentDoneBySignature: null,
  receivedBySignature: null,
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-border bg-muted/40">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  );
}

function SignatureUpload({
  label,
  value,
  onChange,
  ocid,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  ocid: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange((ev.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {value ? (
        <div className="relative inline-block border border-border rounded-md p-2 bg-muted/20">
          <img
            src={value}
            alt={label}
            className="h-16 max-w-xs object-contain block"
          />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
            aria-label="Remove signature"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          data-ocid={ocid}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-border rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          Upload Signature Image
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

function PrintableSlip({ data }: { data: SlipData }) {
  const slipRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4" id="slip-print-wrapper">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          Slip Preview
        </h2>
        <Button
          type="button"
          onClick={handlePrint}
          variant="default"
          size="sm"
          data-ocid="print-slip-btn"
          className="gap-2 print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print Slip
        </Button>
      </div>

      {/* Printable area */}
      <div
        ref={slipRef}
        id="printable-slip"
        className="bg-white border-2 border-border rounded-lg p-8 font-body text-sm text-foreground print:border-black print:shadow-none print:rounded-none"
        style={{ fontFamily: "serif" }}
      >
        {/* Header */}
        <div className="text-center mb-5 pb-4 border-b-2 border-current">
          <div className="mt-2 bg-gray-100 py-2 px-6 rounded-sm inline-block">
            <p className="text-xl font-bold uppercase tracking-widest">
              Payment Receipt
            </p>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-current pb-1">
            Transaction Details
          </h2>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <SlipRow
                label="Transaction Date"
                value={
                  data.transactionDate
                    ? new Date(data.transactionDate).toLocaleDateString(
                        "en-IN",
                        { day: "2-digit", month: "long", year: "numeric" },
                      )
                    : "—"
                }
              />
              <SlipRow
                label="Transaction Status"
                value={data.transactionStatus || "—"}
              />
              <SlipRow label="Objective" value={data.objective || "—"} />
              <SlipRow
                label="Mode of Payment"
                value={data.modeOfPayment || "—"}
              />
            </tbody>
          </table>
        </div>

        {/* Transaction Parties */}
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-current pb-1">
            Transaction Parties
          </h2>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <SlipRow label="From" value={data.from || "—"} />
              <SlipRow label="To" value={data.to || "—"} />
              <SlipRow label="Place" value={data.place || "—"} />
            </tbody>
          </table>
        </div>

        {/* Transaction Amount */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-current pb-1">
            Transaction Amount
          </h2>
          <table className="w-full text-xs border-collapse">
            <tbody>
              <SlipRow
                label="Amount (₹)"
                value={
                  data.amount
                    ? `₹ ${Number(data.amount).toLocaleString("en-IN")}`
                    : "—"
                }
                valueClassName="font-bold text-sm"
              />
              <SlipRow
                label="Amount in Words"
                value={data.amountInWords || "—"}
              />
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-current pb-1">
            Authorised Signatures
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <SignatureBox
              label="Payment Done By"
              signature={data.paymentDoneBySignature}
            />
            <SignatureBox
              label="Received By"
              signature={data.receivedBySignature}
            />
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 pt-3 border-t border-current">
          <p className="text-[10px] leading-relaxed text-gray-700 font-medium">
            <span className="font-bold">Note:</span> This amount is liable to
            refund within 15 days of an application or if any irregularities
            found in the documents before approval, this slip is a proof of
            payment only, third party can claim it any time they want.
          </p>
        </div>

        {/* Official Post — bottom right */}
        <div className="mt-4 flex justify-end">
          <div className="text-right border-t border-current pt-2 min-w-[200px]">
            <p className="text-[11px] font-bold">Sub Divisional Inspector(P)</p>
            <p className="text-[11px]">R.O Jabalpur M.P</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-slip, #printable-slip * { visibility: visible !important; }
          #printable-slip {
            position: fixed !important;
            left: 0; top: 0;
            width: 100%;
            padding: 30px !important;
            border: none !important;
            font-family: serif !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}

function SlipRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <tr className="border-b border-gray-200 last:border-0">
      <td className="py-1.5 pr-4 font-medium text-gray-600 w-40 align-top whitespace-nowrap">
        {label}
      </td>
      <td className="py-1.5">
        <span className="text-gray-500 mr-2">:</span>
        <span className={valueClassName ?? "text-gray-900"}>{value}</span>
      </td>
    </tr>
  );
}

function SignatureBox({
  label,
  signature,
}: {
  label: string;
  signature: string | null;
}) {
  return (
    <div className="space-y-1">
      <div className="h-16 border border-gray-400 rounded-sm flex items-center justify-center bg-gray-50">
        {signature ? (
          <img
            src={signature}
            alt={label}
            className="h-14 max-w-full object-contain"
          />
        ) : (
          <span className="text-gray-400 text-xs italic">Signature</span>
        )}
      </div>
      <p className="text-[11px] text-center font-medium text-gray-700">
        {label}
      </p>
    </div>
  );
}

export default function SlipGenerate() {
  const [form, setForm] = useState<SlipData>(EMPTY_SLIP);
  const [showSlip, setShowSlip] = useState(false);

  function set<K extends keyof SlipData>(key: K, value: SlipData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setShowSlip(false);
  }

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setShowSlip(true);
    setTimeout(() => {
      document
        .getElementById("slip-print-wrapper")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-ocid="slip-generate-page">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2.5">
          <Receipt className="w-6 h-6 text-primary flex-shrink-0" />
          Slip Generate
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fill transaction details to generate an official payment receipt
        </p>
      </div>

      <Separator />

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Section 1 — Transaction Details */}
        <SectionCard title="Section 1 — Transaction Details">
          <FieldRow>
            <div className="space-y-1.5">
              <Label htmlFor="txn-date">
                Transaction Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="txn-date"
                type="date"
                value={form.transactionDate}
                onChange={(e) => set("transactionDate", e.target.value)}
                required
                data-ocid="slip-txn-date"
                className="form-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mode-payment">
                Mode of Payment <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.modeOfPayment}
                onValueChange={(v) => set("modeOfPayment", v)}
                required
              >
                <SelectTrigger
                  id="mode-payment"
                  data-ocid="slip-mode-payment"
                  className="form-input"
                >
                  <SelectValue placeholder="Select mode…" />
                </SelectTrigger>
                <SelectContent>
                  {["Cash", "Cheque", "DD", "NEFT", "RTGS", "UPI"].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FieldRow>
          <div className="space-y-1.5">
            <Label htmlFor="objective">
              Objective <span className="text-destructive">*</span>
            </Label>
            <Input
              id="objective"
              placeholder="Purpose / description of the payment…"
              value={form.objective}
              onChange={(e) => set("objective", e.target.value)}
              required
              data-ocid="slip-objective"
              className="form-input"
            />
          </div>
          {/* Transaction Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Transaction Status <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-6 flex-wrap">
              {(["Registration", "Approval", "Completed"] as const).map(
                (status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer select-none"
                    data-ocid={`slip-status-${status.toLowerCase()}`}
                  >
                    <input
                      type="radio"
                      name="transactionStatus"
                      value={status}
                      checked={form.transactionStatus === status}
                      onChange={() => set("transactionStatus", status)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {status}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>
        </SectionCard>

        {/* Section 2 — Transaction Parties */}
        <SectionCard title="Section 2 — Transaction Parties">
          <FieldRow>
            <div className="space-y-1.5">
              <Label htmlFor="from">
                From <span className="text-destructive">*</span>
              </Label>
              <Input
                id="from"
                placeholder="Payer name / organization"
                value={form.from}
                onChange={(e) => set("from", e.target.value)}
                required
                data-ocid="slip-from"
                className="form-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">
                To <span className="text-destructive">*</span>
              </Label>
              <Input
                id="to"
                placeholder="Receiver name / organization"
                value={form.to}
                onChange={(e) => set("to", e.target.value)}
                required
                data-ocid="slip-to"
                className="form-input"
              />
            </div>
          </FieldRow>
          <div className="space-y-1.5">
            <Label htmlFor="place">
              Place <span className="text-destructive">*</span>
            </Label>
            <Input
              id="place"
              placeholder="City / location where transaction takes place"
              value={form.place}
              onChange={(e) => set("place", e.target.value)}
              required
              data-ocid="slip-place"
              className="form-input"
            />
          </div>
        </SectionCard>

        {/* Section 3 — Transaction Amount */}
        <SectionCard title="Section 3 — Transaction Amount">
          <FieldRow>
            <div className="space-y-1.5">
              <Label htmlFor="amount">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                required
                data-ocid="slip-amount"
                className="form-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amount-words">
                Amount in Words <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount-words"
                placeholder="e.g. Five Hundred Rupees Only"
                value={form.amountInWords}
                onChange={(e) => set("amountInWords", e.target.value)}
                required
                data-ocid="slip-amount-words"
                className="form-input"
              />
            </div>
          </FieldRow>
        </SectionCard>

        {/* Section 4 — Signatures */}
        <SectionCard title="Section 4 — Signatures">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SignatureUpload
              label="Payment Done By (Signature)"
              value={form.paymentDoneBySignature}
              onChange={(v) => set("paymentDoneBySignature", v)}
              ocid="slip-sig-payer"
            />
            <SignatureUpload
              label="Received By (Signature)"
              value={form.receivedBySignature}
              onChange={(v) => set("receivedBySignature", v)}
              ocid="slip-sig-receiver"
            />
          </div>
        </SectionCard>

        {/* Generate button */}
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            size="lg"
            data-ocid="generate-slip-btn"
            className="gap-2 px-8"
          >
            <Receipt className="w-4 h-4" />
            Generate Slip
          </Button>
        </div>
      </form>

      {/* Printable slip preview */}
      {showSlip && (
        <div className="mt-4">
          <PrintableSlip data={form} />
        </div>
      )}
    </div>
  );
}
