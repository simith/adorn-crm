import { type ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
    return <div className="min-h-screen bg-[#fff8f1]">{children}</div>;
};

export default AuthLayout;
