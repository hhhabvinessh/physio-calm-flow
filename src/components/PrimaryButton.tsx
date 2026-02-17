import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "secondary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const PrimaryButton = ({
  children,
  onClick,
  className,
  variant = "default",
  disabled = false,
  type = "button",
  fullWidth = true,
}: PrimaryButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      type={type}
      disabled={disabled}
      className={cn(
        "h-12 rounded-[14px] text-[15px] font-medium transition-colors",
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
