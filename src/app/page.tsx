import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Login",
};

const HomePage = () => {
    redirect("/auth/login");
};

export default HomePage;
