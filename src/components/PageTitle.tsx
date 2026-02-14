import { ReactNode } from "react";

type IPageTitle = {
    title: string;
    centerItem?: ReactNode;
};

export const PageTitle = ({ title, centerItem }: IPageTitle) => {
    return (
        <div className="flex items-center justify-between">
            <p className="text-lg font-medium">{title}</p>
            {centerItem != null && centerItem}
        </div>
    );
};
