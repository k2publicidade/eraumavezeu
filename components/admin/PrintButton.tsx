"use client";

export default function PrintButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ||
        "bg-primary hover:bg-primary-dark text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
      }
    >
      {label}
    </button>
  );
}
