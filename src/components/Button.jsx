import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    onClick,
    isLoading = false,
    disabled = false,
    type = 'button',
    variant = 'primary',
    className = '',
    ...props
}) => {
    const baseClass = variant === 'primary' ? 'primary-button' : 'secondary-button';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading || disabled}
            className={`${baseClass} ${className}`}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="animate-spin" width={20} height={20} />
                    <span>Processing...</span>
                </>
            ) : children}
        </button>
    );
};

export default Button;
