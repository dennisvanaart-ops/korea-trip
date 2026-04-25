interface Props {
  children: React.ReactNode;
  className?: string;
}

export function WarningBlock({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-800 ${className}`}
    >
      {children}
    </div>
  );
}
