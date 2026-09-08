import { useRef, useState } from "react";

interface FileUploaderProps {
  accept: string;
  maxSizeMb: number;
  file: File | null;
  onSelect: (file: File | null) => void;
  onError: (message: string) => void;
  hint?: string;
}

export function FileUploader({
  accept,
  maxSizeMb,
  file,
  onSelect,
  onError,
  hint,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const accepted = accept.split(",").map((a) => a.trim());

  const validate = (candidate: File) => {
    const typeOk = accepted.some((a) =>
      a.endsWith("/*") ? candidate.type.startsWith(a.slice(0, -1)) : candidate.type === a,
    );
    if (!typeOk) {
      onError("That file type isn't supported here.");
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      onError(`That file is larger than ${maxSizeMb} MB.`);
      return;
    }
    onSelect(candidate);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files?.[0];
        if (dropped) validate(dropped);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border border-dashed p-10 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const picked = e.target.files?.[0];
          if (picked) validate(picked);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB — click to choose another
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold">Drop a file here or click to browse</p>
          <p className="text-xs text-muted-foreground">
            {hint ?? `Up to ${maxSizeMb} MB`}
          </p>
        </div>
      )}
    </div>
  );
}
