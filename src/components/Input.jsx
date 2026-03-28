import React, { useState } from 'react';
import { Mail, Lock, User, Phone, BadgeCheck, ChevronDown, Eye, EyeOff } from 'lucide-react';

const Input = ({
    label,
    icon: Icon,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="form-group animate-fade-in" style={{ animationDelay: '0.1s' }}>
            {label && <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '14px' }}>{label}</label>}
            <div className={`input-container ${error ? 'border-error' : ''}`} style={{ position: 'relative' }}>
                {Icon && <Icon className="input-icon" />}
                <input
                    type={isPassword && showPassword ? 'text' : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={isPassword ? { paddingRight: '40px' } : {}}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8',
                            padding: 0
                        }}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <span style={{ color: 'var(--error-red)', fontSize: '12px', marginTop: '4px' }}>{error}</span>}
        </div>
    );
};

export default Input;
