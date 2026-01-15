import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
      <textarea
        className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-[#a4a3d0]/40 bg-[#e7e9e5]/50 px-3 py-2 text-sm text-[#2c3150] ring-offset-background placeholder:text-[#a4a3d0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8460ea] focus-visible:ring-offset-2 focus-visible:border-[#8460ea] disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        className,
        )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
