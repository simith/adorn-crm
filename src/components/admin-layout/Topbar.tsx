import { ThemeToggle } from "@/components/ThemeToggle";

import { TopbarBranchMenu } from "./TopbarBranchMenu";
import { TopbarNotificationButton } from "./TopbarNotificationButton";
import { TopbarProfileMenu } from "./TopbarProfileMenu";
import { TopbarInlineSearch } from "./TopbarInlineSearch";

export const Topbar = () => {
    return (
        <div
            role="navigation"
            aria-label="Navbar"
            className="flex items-center justify-between gap-3 px-3"
            id="layout-topbar">
            <div className="inline-flex shrink-0 items-center gap-3">
                <label
                    className="btn btn-square btn-ghost btn-sm group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:hidden"
                    aria-label="Leftmenu toggle"
                    htmlFor="layout-sidebar-toggle-trigger">
                    <span className="iconify lucide--menu size-5" />
                </label>
                <label
                    className="btn btn-square btn-ghost btn-sm hidden group-has-[[id=layout-sidebar-hover-trigger]:checked]/html:flex"
                    aria-label="Leftmenu toggle"
                    htmlFor="layout-sidebar-hover-trigger">
                    <span className="iconify lucide--menu size-5" />
                </label>
            </div>
            <div className="flex min-w-0 flex-1 justify-center">
                <TopbarInlineSearch />
            </div>
            <div className="inline-flex shrink-0 items-center gap-0.5">
                <TopbarBranchMenu />
                <ThemeToggle className="btn btn-sm btn-circle btn-ghost" />
                <label htmlFor="layout-rightbar-drawer" className="btn btn-circle btn-ghost btn-sm drawer-button">
                    <span className="iconify lucide--settings-2 size-4.5" />
                </label>
                <TopbarNotificationButton />
                <TopbarProfileMenu />
            </div>
        </div>
    );
};
