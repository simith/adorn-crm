type ILogo = {
    className?: string;
};

export const Logo = ({ className }: ILogo) => {
    return (
        <img
            src="/images/logo/abharan-logo.svg"
            alt="Abharan Jewellers"
            className={`h-12 w-auto ${className ?? ""}`}
        />
    );
};
