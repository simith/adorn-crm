"use client";

import Link from "next/link";

export const TopbarInlineSearch = () => {
    return (
        <div className="dropdown dropdown-bottom dropdown-end w-full max-w-md">
            <div tabIndex={0} className="input input-sm flex w-full items-center gap-2 px-2">
                <span className="iconify lucide--search text-base-content/70 size-4" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="grow bg-transparent text-sm focus:outline-none"
                    aria-label="Search"
                />
            </div>

            <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box mt-1 w-full min-w-56 shadow-sm">
                <ul className="menu menu-sm w-full p-1">
                    <li>
                        <p className="menu-title">Search results</p>
                    </li>
                    <li>
                        <Link href="/dashboard">
                            <span className="iconify lucide--layout-dashboard size-4" />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/pages/settings">
                            <span className="iconify lucide--settings size-4" />
                            <span className="text-sm">Settings</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/auth/login">
                            <span className="iconify lucide--log-in size-4" />
                            <span className="text-sm">Login</span>
                        </Link>
                    </li>
                </ul>

                <hr className="border-base-300 my-1 border-dashed" />

                <ul className="menu menu-sm w-full p-1">
                    <li>
                        <p className="menu-title">Recent</p>
                    </li>
                    <li>
                        <Link href="/dashboard">
                            <span className="iconify lucide--layout-dashboard size-4" />
                            <span className="text-sm">Dashboard</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    );
};
