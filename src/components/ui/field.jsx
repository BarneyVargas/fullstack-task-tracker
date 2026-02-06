import { cn } from "@/lib/utils";

function Field({ className, invalid = false, ...props }) {
  return (
    <div
      data-invalid={invalid ? "true" : undefined}
      className={cn(
        "grid gap-2",
        "data-[invalid=true]:[&_[data-slot=label]]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

export { Field };
