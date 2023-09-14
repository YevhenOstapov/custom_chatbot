import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "text-md flex  w-full rounded-md border  bg-transparent px-3 py-2 ring-offset-background placeholder:text-gray-alpha-700 focus-visible:border-transparent  focus-visible:bg-gray-alpha-200 focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white-300 dark:text-gray-200 dark:placeholder:text-gray-alpha-400 dark:focus-visible:border-transparent dark:focus-visible:bg-white-300",
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
