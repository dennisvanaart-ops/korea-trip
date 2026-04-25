interface Props {
  children: React.ReactNode;
  className?: string;
}

export function InfoBlock({ children, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800 ${className}`}
    >
      {children}
    </div>
  );
}
