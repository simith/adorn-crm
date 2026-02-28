import { ReactNode } from "react";

type SalesChartCardProps = {
    title: string;
    description: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
};

export const SalesChartCard = ({ title, description, action, children, className = "" }: SalesChartCardProps) => {
    return (
        <section className={`rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm ${className}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-semibold text-base-content md:text-lg">{title}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-base-content/60">{description}</p>
                </div>
                {action ? <div className="flex items-center gap-2">{action}</div> : null}
            </div>
            <div className="mt-5">{children}</div>
        </section>
    );
};
