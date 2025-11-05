interface ButtonProps {
    onClick: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'lightBorder';
}

export const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'primary' }) => {
    const baseClasses = 'px-4 py-2 rounded font-medium cursor-pointer border-none transition-colors';
    const variantClasses = {
        primary: 'bg-primary hover:bg-primary-dark text-surface-primary',
        lightBorder: 'bg-primary hover:bg-primary-dark text-surface-primary border border-gray-200 hover:border-gray-300',
        secondary: 'bg-surface-primary hover:bg-gray-100 text-content-primary border border-gray-200',
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses[variant]}`}
        >
            {children}
        </button>
    );
};