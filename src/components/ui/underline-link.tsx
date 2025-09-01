"use client";

import Link, { LinkProps } from "next/link";
import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";

type Props = LinkProps & ComponentPropsWithoutRef<typeof Link> & { underlineClassName?: string };

export function UnderlineLink({ className, underlineClassName, children, ...props }: Props) {
  return (
    <Link
      {...props}
      className={cn(
        "relative inline-block text-sm text-muted-foreground transition-colors hover:text-foreground",
        className
      )}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className={cn(
            "absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 bg-current/70 transition-transform duration-300 ease-out group-hover:scale-x-100",
            underlineClassName
          )}
        />
      </span>
    </Link>
  );
}
