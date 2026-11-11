import { useRef, useState } from "react";
import { FileText, Paperclip, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { ALLOWED_TYPES, MAX_FILES, MAX_FILE_SIZE, formatFileSize } from "./constants";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export function AttachmentPicker({ files, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const next = [...files];
    let message: string | null = null;
    for (const file of picked) {
      if (!ALLOWED_TYPES.includes(file.type)) message = `${file.name}: only JPG, PNG, WebP or PDF files are allowed.`;
      else if (file.size > MAX_FILE_SIZE) message = `${file.name} is larger than 5 MB.`;
      else if (next.length >= MAX_FILES) { message = `You can attach up to ${MAX_FILES} files.`; break; }
      else next.push(file);
    }
    setError(message);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={ALLOWED_TYPES.join(",")}
        onChange={handlePick}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || files.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Paperclip className="h-4 w-4" /> Attach files
      </Button>
      <span className="ml-2 text-xs text-muted-foreground">
        JPG, PNG, WebP or PDF · up to {MAX_FILES} files · 5 MB each
      </span>
      {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5 text-xs">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="max-w-[160px] truncate">{file.name}</span>
              <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                className="text-muted-foreground hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
