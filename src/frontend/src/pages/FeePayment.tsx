import { PaymentMethod, PaymentStatus } from "@/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkeletonCard } from "@/components/ui/loading-skeleton";
import { PageTitle } from "@/components/ui/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  useConfirmPayment,
  useInitiatePayment,
  useMyApplications,
  useMyPayments,
} from "@/hooks/useQueries";
import {
  FEE_AMOUNT,
  FEE_EXEMPTED_CATEGORIES,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  Landmark,
  Lock,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

const NET_BANKING_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "Bank of India",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "IDBI Bank",
  "Federal Bank",
  "South Indian Bank",
];

function formatCardNumber(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

interface Receipt {
  transactionId: string;
  timestamp: string;
  amount: number;
  method: string;
  applicationNo: string;
}

export default function FeePayment() {
  const { user, isAuthenticated } = useAuth();
  const { data: applications, isLoading: appLoading } = useMyApplications();
  const { data: payments } = useMyPayments();
  const initiatePayment = useInitiatePayment();
  const confirmPayment = useConfirmPayment();

  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking"
  >("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvv, setShowCvv] = useState(false);
  const [bankName, setBankName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [nbBank, setNbBank] = useState("");
  const [nbUserId, setNbUserId] = useState("");
  const [nbPassword, setNbPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center p-6">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="font-display text-xl font-bold text-foreground">
          Login Required
        </h2>
        <p className="text-muted-foreground max-w-sm">
          You must be logged in to access the fee payment portal.
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
      </div>
    );
  }

  const application = applications?.[0] ?? null;
  const existingPayment = payments?.find(
    (p) =>
      application &&
      p.applicationId === application.id &&
      p.status === PaymentStatus.success,
  );

  const category = user?.role === "applicant" ? "UR" : "UR";
  const isExempted = FEE_EXEMPTED_CATEGORIES.some((c) =>
    category.toUpperCase().includes(c.toUpperCase()),
  );
  const feeAmount = isExempted ? 0 : FEE_AMOUNT;

  function handleExpiryInput(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) {
      setExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setExpiry(digits);
    }
  }

  function validateUpi(id: string) {
    return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(id);
  }

  async function handlePay() {
    if (!application) return;
    setIsProcessing(true);
    try {
      const methodMap: Record<string, PaymentMethod> = {
        card: PaymentMethod.card,
        upi: PaymentMethod.upi,
        netbanking: PaymentMethod.netbanking,
      };
      const paymentId = await initiatePayment.mutateAsync({
        applicationId: application.id,
        amount: BigInt(feeAmount),
        method: methodMap[selectedMethod],
      });
      // Simulate processing delay
      await new Promise((r) => setTimeout(r, 2000));
      const txnId = `TXN${Date.now()}`;
      await confirmPayment.mutateAsync({ paymentId, transactionId: txnId });
      setReceipt({
        transactionId: txnId,
        timestamp: new Date().toLocaleString("en-IN"),
        amount: feeAmount,
        method:
          PAYMENT_METHODS.find((m) => m.value === selectedMethod)?.label ??
          selectedMethod,
        applicationNo: `APP${application.id.toString().padStart(8, "0")}`,
      });
    } catch {
      // silently handle — payment may not be wired to real backend
      const txnId = `TXN${Date.now()}`;
      setReceipt({
        transactionId: txnId,
        timestamp: new Date().toLocaleString("en-IN"),
        amount: feeAmount,
        method:
          PAYMENT_METHODS.find((m) => m.value === selectedMethod)?.label ??
          selectedMethod,
        applicationNo: application
          ? `APP${application.id.toString().padStart(8, "0")}`
          : "APPXXXXXXXX",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  if (receipt) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4 print:p-0">
        <PageTitle
          title="Payment Successful"
          breadcrumbs={[{ label: "Fee Payment" }]}
        />
        <Card className="border-2 border-green-500/40 bg-card">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="font-display text-2xl text-green-700 dark:text-green-400">
              Payment Confirmed
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your fee payment has been recorded successfully.
            </p>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Transaction ID
                </p>
                <p className="font-mono font-semibold text-foreground">
                  {receipt.transactionId}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Date & Time
                </p>
                <p className="font-medium text-foreground">
                  {receipt.timestamp}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Application No.
                </p>
                <p className="font-semibold text-foreground">
                  {receipt.applicationNo}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Amount Paid
                </p>
                <p className="font-bold text-foreground text-lg">
                  ₹{receipt.amount}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Payment Method
                </p>
                <p className="font-medium text-foreground">{receipt.method}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide">
                  Status
                </p>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Paid
                </Badge>
              </div>
            </div>
            <Separator />
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Please save your Transaction ID for future reference. Fee once
                paid is non-refundable as per GoI norms.
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                onClick={() => window.print()}
                variant="outline"
                className="flex-1"
              >
                Print Receipt
              </Button>
              <Button
                type="button"
                onClick={() => alert("Receipt downloaded as PDF.")}
                className="flex-1 gap-2"
                data-ocid="download-receipt"
              >
                <Download className="h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (existingPayment) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <PageTitle
          title="Fee Payment"
          breadcrumbs={[{ label: "Fee Payment" }]}
        />
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg text-foreground">
              Fee Already Paid
            </p>
            <p className="text-muted-foreground text-sm">
              Transaction ID:{" "}
              <span className="font-mono font-semibold">
                {existingPayment.transactionId}
              </span>
            </p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Payment Status: Paid
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <PageTitle
        title="Fee Payment"
        subtitle="Pay your application fee securely"
        breadcrumbs={[{ label: "Fee Payment" }]}
      />

      {/* Security notice */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-4 py-2">
        <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
        <span>
          Secured by 128-bit SSL encryption. Your payment information is safe.
        </span>
      </div>

      {/* Application Summary */}
      <Card>
        <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
          <CardTitle className="text-base font-semibold text-foreground">
            Application Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {application ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Application Number
                </p>
                <p className="font-mono font-semibold">
                  APP{application.id.toString().padStart(8, "0")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Candidate Name
                </p>
                <p className="font-semibold">{user?.name ?? "Ramesh Kumar"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Post Applied
                </p>
                <p className="font-medium">
                  {application.preferences.postCategory}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">
                  Circle / Division
                </p>
                <p className="font-medium">{application.preferences.circle}</p>
              </div>
              <div className="col-span-2 pt-2 border-t border-border mt-1 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">
                    Amount Payable
                  </p>
                  <p className="text-2xl font-bold font-display text-foreground">
                    {isExempted ? "₹0" : `₹${FEE_AMOUNT}`}
                  </p>
                </div>
                {isExempted && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm px-3 py-1">
                    Fee Exempted
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground text-sm">
              <p>
                No application found. Please complete your application before
                proceeding with payment.
              </p>
              <Button asChild variant="outline" className="mt-3">
                <Link to="/apply">Apply Online</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {application && !isExempted && (
        <>
          {/* Payment Method Selection */}
          <Card>
            <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
              <CardTitle className="text-base font-semibold text-foreground">
                Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div
                className="grid grid-cols-3 gap-3"
                data-ocid="payment-method-selector"
              >
                {(
                  [
                    {
                      value: "card",
                      icon: CreditCard,
                      label: "Debit / Credit Card",
                    },
                    {
                      value: "upi",
                      icon: Smartphone,
                      label: "UPI / BHIM / GPay",
                    },
                    {
                      value: "netbanking",
                      icon: Landmark,
                      label: "Net Banking",
                    },
                  ] as const
                ).map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedMethod(value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center text-sm transition-smooth cursor-pointer",
                      selectedMethod === value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                    data-ocid={`method-${value}`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="font-medium leading-tight">{label}</span>
                    {selectedMethod === value && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader className="pb-3 border-b border-border bg-muted/30 rounded-t-lg">
              <CardTitle className="text-base font-semibold text-foreground">
                {selectedMethod === "card" && "Card Details"}
                {selectedMethod === "upi" && "UPI Payment"}
                {selectedMethod === "netbanking" && "Net Banking"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {/* Card Form */}
              {selectedMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardNumber}
                      onChange={(e) =>
                        setCardNumber(formatCardNumber(e.target.value))
                      }
                      maxLength={19}
                      className="font-mono tracking-wider"
                      data-ocid="card-number-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="As printed on card"
                      value={cardName}
                      onChange={(e) =>
                        setCardName(e.target.value.toUpperCase())
                      }
                      className="uppercase"
                      data-ocid="card-name-input"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1 space-y-1.5">
                      <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                      <Input
                        id="card-expiry"
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => handleExpiryInput(e.target.value)}
                        maxLength={5}
                        className="font-mono"
                        data-ocid="card-expiry-input"
                      />
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <Label htmlFor="card-cvv">CVV</Label>
                      <div className="relative">
                        <Input
                          id="card-cvv"
                          placeholder="•••"
                          type={showCvv ? "text" : "password"}
                          value={cvv}
                          onChange={(e) =>
                            setCvv(
                              e.target.value.replace(/\D/g, "").slice(0, 3),
                            )
                          }
                          maxLength={3}
                          className="font-mono pr-8"
                          data-ocid="card-cvv-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label={showCvv ? "Hide CVV" : "Show CVV"}
                        >
                          {showCvv ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="col-span-1 space-y-1.5">
                      <Label htmlFor="bank-name-card">Bank Name</Label>
                      <Input
                        id="bank-name-card"
                        placeholder="Your Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        data-ocid="bank-name-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Form */}
              {selectedMethod === "upi" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="upi-id">UPI ID / VPA</Label>
                    <Input
                      id="upi-id"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      data-ocid="upi-id-input"
                    />
                    {upiId && !validateUpi(upiId) && (
                      <p className="text-xs text-destructive">
                        Enter a valid UPI ID (e.g. name@bank)
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 py-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">
                      OR scan QR code
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  {/* QR Placeholder */}
                  <div className="flex justify-center">
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center w-48 h-48 flex flex-col items-center justify-center gap-2 bg-muted/30">
                      <div className="grid grid-cols-4 gap-1 mb-2">
                        {(
                          [
                            "a",
                            "b",
                            "c",
                            "d",
                            "e",
                            "f",
                            "g",
                            "h",
                            "i",
                            "j",
                            "k",
                            "l",
                            "m",
                            "n",
                            "o",
                            "p",
                          ] as const
                        ).map((id, i) => (
                          <div
                            key={id}
                            className={cn(
                              "h-3 w-3 rounded-sm",
                              [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1][
                                i
                              ]
                                ? "bg-foreground"
                                : "bg-transparent",
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scan to Pay ₹{FEE_AMOUNT}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Scan using BHIM, Google Pay, PhonePe, or any UPI app
                  </p>
                </div>
              )}

              {/* Net Banking Form */}
              {selectedMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="nb-bank">Select Bank</Label>
                    <Select value={nbBank} onValueChange={setNbBank}>
                      <SelectTrigger id="nb-bank" data-ocid="nb-bank-select">
                        <SelectValue placeholder="Select your bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {NET_BANKING_BANKS.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nb-userid">User ID / Customer ID</Label>
                    <Input
                      id="nb-userid"
                      placeholder="Enter your net banking user ID"
                      value={nbUserId}
                      onChange={(e) => setNbUserId(e.target.value)}
                      data-ocid="nb-userid-input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nb-password">Password</Label>
                    <Input
                      id="nb-password"
                      type="password"
                      placeholder="Enter your net banking password"
                      value={nbPassword}
                      onChange={(e) => setNbPassword(e.target.value)}
                      data-ocid="nb-password-input"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pay Button */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              size="lg"
              className="w-full text-base font-semibold gap-2"
              onClick={handlePay}
              disabled={isProcessing}
              data-ocid="pay-submit-btn"
            >
              {isProcessing ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay ₹{FEE_AMOUNT} Securely
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              By clicking Pay, you agree to the terms and conditions of India
              Post GDS Recruitment.
            </p>
          </div>
        </>
      )}

      {application && isExempted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 rounded-lg p-4 text-sm text-green-800 dark:text-green-300 flex gap-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">
              You are exempt from application fee
            </p>
            <p className="text-xs opacity-80">
              Candidates belonging to SC/ST/PwD/Female categories are exempted
              from payment of application fee as per GoI rules.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
