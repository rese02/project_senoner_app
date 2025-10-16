import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M17.5 6.5C15.5 5 13.5 4 12 4s-3.5 1-5.5 2.5" />
      <path d="M6.5 17.5C8.5 19 10.5 20 12 20s3.5-1 5.5-2.5" />
      <path d="M12 4v16" />
      <path d="M12 4a4 4 0 0 0-4 4" />
      <path d="M12 20a4 4 0 0 1 4-4" />
    </svg>
  );
}
