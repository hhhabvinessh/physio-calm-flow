import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  children?: React.ReactNode;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
}

const FormField = ({
  label,
  children,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  maxLength,
  className,
}: FormFieldProps) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id} className="text-[13px] font-medium text-muted-foreground">
        {label}
      </Label>
      {children || (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          className="h-12 rounded-xl border-border bg-card text-[15px] focus-visible:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
};

export default FormField;
