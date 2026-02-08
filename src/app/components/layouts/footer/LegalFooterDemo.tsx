import Link from "next/link";

export const LegalFooterDemo = () => {
    return (
        <div className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span className="text-base-content/80 text-sm">
                © {new Date().getFullYear()} Nexus. All rights reserved
            </span>
            <div className="flex flex-wrap items-center gap-0.5 text-xs *:px-2 *:py-1 *:opacity-70 *:transition-all *:hover:opacity-100 sm:text-sm">
                <Link href="#">Terms of Use</Link>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Legal & Compliance</Link>
            </div>
        </div>
    );
};
