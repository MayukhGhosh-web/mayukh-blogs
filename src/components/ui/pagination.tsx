"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

// Utility function to concatenate class names
function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center mt-8", className)}
      {...props}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

export function PaginationItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />;
}

type PaginationLinkProps = {
  href: string;
  isActive?: boolean;
  children: React.ReactNode;
};

export function PaginationLink({
  href,
  isActive,
  children,
  className,
  ...props
}: PaginationLinkProps & React.ComponentProps<"a">) {
  return (
    <Link
      href={href}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors border border-transparent",
        isActive
          ? "bg-purple-700 text-white border-purple-600"
          : "bg-purple-800 text-white hover:bg-purple-700",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

export function PaginationPrevious({
  href,
  className,
  ...props
}: {
  href: string;
} & React.ComponentProps<"a">) {
  return (
    <PaginationLink
      href={href}
      className={cn("flex items-center gap-1 px-3", className)}
      {...props}
    >
      <ChevronLeftIcon className="w-4 h-4" />
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  );
}

export function PaginationNext({
  href,
  className,
  ...props
}: {
  href: string;
} & React.ComponentProps<"a">) {
  return (
    <PaginationLink
      href={href}
      className={cn("flex items-center gap-1 px-3", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <ChevronRightIcon className="w-4 h-4" />
    </PaginationLink>
  );
}

export function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex w-9 h-9 items-center justify-center text-black",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="w-4 h-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
