export type IStatItem = {
    title: string;
    amount: string;
    percent: number;
    icon: string;
};

export const StatItem = ({ title, percent, amount, icon }: IStatItem) => {
    const positive = percent >= 0;

    return (
        <article className="rounded-2xl border border-base-200 bg-base-100 shadow-sm">
            <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3">
                    <div className="bg-base-200 rounded-xl flex size-10 items-center justify-center">
                        <span className={`iconify size-4.5 ${icon}`} />
                    </div>
                    <span
                        className={`badge badge-sm border-0 px-2.5 ${
                            positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}>
                        {positive ? "+" : ""}
                        {percent}%
                    </span>
                </div>
                <div>
                    <p className="text-sm font-medium text-base-content/65">{title}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-base-content">{amount}</p>
                    <p className="mt-1 text-xs text-base-content/45">vs previous period</p>
                </div>
            </div>
        </article>
    );
};
