import { Skeleton } from "@/components/skeletons";

export const SalesPerformanceSkeleton = () => {
    return (
        <div className="mt-6 space-y-6">
            <div className="rounded-[28px] border border-base-200 bg-base-100 p-6">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="mt-3 h-10 w-72" />
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[...Array(5)].map((_, index) => (
                        <Skeleton key={index} className="h-20 w-full rounded-[22px]" />
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(8)].map((_, index) => (
                    <Skeleton key={index} className="h-44 w-full rounded-[24px]" />
                ))}
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-7" />
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-5" />
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-6" />
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-6" />
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-5" />
                <Skeleton className="h-[360px] w-full rounded-[28px] xl:col-span-7" />
                <Skeleton className="h-[420px] w-full rounded-[28px] xl:col-span-12" />
            </div>
        </div>
    );
};
