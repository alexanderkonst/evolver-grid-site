import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-[#a4a3d0]/40 bg-[#e7e9e5]/50 px-3 py-2 text-base text-[#2c3150] ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#a4a3d0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8460ea] focus-visible:ring-offset-2 focus-visible:border-[#8460ea] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
