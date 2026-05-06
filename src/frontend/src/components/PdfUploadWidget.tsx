import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";

interface PdfUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accentColor?: string; // tailwind color class prefix e.g. "blue" | "red" | "orange"
  ocidPrefix?: string;
}

type UploadState = "idle" | "uploading" | "done" | "error";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function truncateFilename(name: string, max = 36): string {
  if (name.length <= max) return name;
  const ext = name.includes(".") ? `.${name.split(".").pop()}` : "";
  return `${name.slice(0, max - ext.length - 3)}...${ext}`;
}

export default function PdfUploadWidget({
  value,
  onChange,
  label = "Attach PDF",
  accentColor = "blue",
  ocidPrefix = "pdf-widget",
}: PdfUploadWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [filename, setFilename] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const accentMap: Record<
    string,
    { btn: string; text: string; badge: string; border: string }
  > = {
    blue: {
      btn: "bg-blue-700 hover:bg-blue-800 text-white",
      text: "text-blue-700",
      badge: "bg-blue-50 border-blue-200 text-blue-800",
      border: "border-blue-300",
    },
    red: {
      btn: "bg-red-700 hover:bg-red-800 text-white",
      text: "text-red-700",
      badge: "bg-red-50 border-red-200 text-red-800",
      border: "border-red-300",
    },
    orange: {
      btn: "bg-orange-600 hover:bg-orange-700 text-white",
      text: "text-orange-700",
      badge: "bg-orange-50 border-orange-200 text-orange-800",
      border: "border-orange-300",
    },
    green: {
      btn: "bg-green-700 hover:bg-green-800 text-white",
      text: "text-green-700",
      badge: "bg-green-50 border-green-200 text-green-800",
      border: "border-green-300",
    },
  };

  const colors = accentMap[accentColor] ?? accentMap.blue;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMsg("Only PDF files are allowed.");
      setUploadState("error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size must be under 10 MB.");
      setUploadState("error");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFilename(file.name);
    setUploadState("uploading");
    setErrorMsg("");

    try {
      // Convert to data URL — functional local URL, no server needed
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
      setUploadState("done");
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setUploadState("error");
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove() {
    onChange("");
    setFilename("");
    setUploadState("idle");
    setErrorMsg("");
  }

  // If a value already exists (pre-existing URL from earlier save), infer filename
  const displayFilename =
    filename ||
    (value && !value.startsWith("data:") ? value.split("/").pop() : filename);

  return (
    <div className="space-y-1.5">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={handleFileChange}
        aria-label={label}
        data-ocid={`${ocidPrefix}-file-input`}
      />

      {/* Idle / empty state */}
      {!value && uploadState !== "uploading" && (
        <button
          type="button"
          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed ${colors.border} bg-muted/20 transition-colors hover:bg-muted/30 cursor-pointer text-left`}
          onClick={() => inputRef.current?.click()}
          aria-label="Click to upload PDF"
          data-ocid={`${ocidPrefix}-dropzone`}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-card border border-border shrink-0">
            <Upload className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              Click to upload PDF
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PDF only · max 10 MB
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            className={`shrink-0 text-xs gap-1.5 ${colors.btn}`}
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            data-ocid={`${ocidPrefix}-upload-button`}
          >
            <Paperclip className="w-3 h-3" />
            Choose PDF
          </Button>
        </button>
      )}

      {/* Uploading state */}
      {uploadState === "uploading" && (
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${colors.border} bg-muted/10`}
        >
          <Loader2 className={`w-5 h-5 animate-spin ${colors.text} shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Uploading…</p>
            <p className="text-xs text-muted-foreground truncate">
              {truncateFilename(filename)}
            </p>
          </div>
        </div>
      )}

      {/* Success / file attached */}
      {value && uploadState !== "uploading" && (
        <div
          className={`flex items-center gap-3 p-3 rounded-lg border ${colors.border} ${colors.badge}`}
          data-ocid={`${ocidPrefix}-success-state`}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-border shrink-0">
            <FileText className={`w-4 h-4 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <p className="text-xs font-semibold text-green-700">
                PDF Attached
              </p>
            </div>
            {displayFilename && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {truncateFilename(displayFilename)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded transition-opacity hover:opacity-80 ${colors.btn}`}
              data-ocid={`${ocidPrefix}-preview-link`}
            >
              <FileText className="w-3 h-3" />
              Preview
            </a>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-white/60 transition-colors"
              title="Replace PDF"
              data-ocid={`${ocidPrefix}-change-button`}
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 rounded hover:bg-destructive/10 text-destructive transition-colors"
              aria-label="Remove PDF"
              data-ocid={`${ocidPrefix}-remove-button`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {uploadState === "error" && errorMsg && (
        <p
          className="text-xs text-destructive flex items-center gap-1 mt-1"
          data-ocid={`${ocidPrefix}-error-state`}
        >
          <span>⚠</span> {errorMsg}
        </p>
      )}
    </div>
  );
}
