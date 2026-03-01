import type { ReactNode } from "react";

type ChartCardProps = {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
};

export const ChartCard = ({ title, subtitle, action, children }: ChartCardProps) => {
    return (
        <section className="rounded-[28px] border border-[#e8e0d1] bg-white p-5 shadow-[0_18px_50px_rgba(64,46,16,0.08)]">
            <div className="flex flex-col gap-3 border-b border-[#f2ebde] pb-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <h2 className="text-base font-semibold text-[#362d1d]">{title}</h2>
                    {subtitle ? <p className="mt-1 text-sm text-[#7c6e57]">{subtitle}</p> : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </div>
            <div className="pt-4">{children}</div>
        </section>
    );
};
