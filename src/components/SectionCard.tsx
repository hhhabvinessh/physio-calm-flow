import { cn } from "@/lib/utils";

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const SectionCard = ({ children, className, onClick, hoverable = false }: SectionCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-border bg-card p-4 card-shadow",
        hoverable && "cursor-pointer transition-shadow duration-150 hover:card-shadow-hover",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SectionCard;
