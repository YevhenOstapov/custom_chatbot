import * as React from "react";

import { cn } from "lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "text-md flex min-h-[80px] w-full rounded-md border  bg-transparent px-3 py-2 ring-offset-background placeholder:text-gray-alpha-700 focus-visible:border-transparent focus-visible:bg-gray-alpha-200 focus-visible:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white-300 dark:text-gray-200 dark:placeholder:text-gray-alpha-400 dark:focus-visible:bg-white-300",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
