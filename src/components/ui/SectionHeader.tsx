/**
 * Studio OS section header — uppercase label with optional right-side action.
 * Follows the `.label-uppercase` design token (11px, 2px letter-spacing).
 *
 * Usage:
 *   <SectionHeader label="Navigation" />
 *   <SectionHeader label="Training Videos" action={<button>+ Add</button>} />
 */
export default function SectionHeader({
  label,
  action,
  className = "",
}: {
  label: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="label-uppercase">{label}</div>
      {action}
    </div>
  );
}
