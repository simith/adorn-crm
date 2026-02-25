type ILogo = {
    className?: string;
};

export const Logo = ({ className }: ILogo) => {
    return (
        <img
            src="/images/logo/malabar-logo.svg"
            alt="Malabar Gold and Diamonds"
            className={`h-12 w-auto ${className ?? ""}`}
        />
    );
};
