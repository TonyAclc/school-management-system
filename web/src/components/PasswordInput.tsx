import { forwardRef, useState } from 'react';
import { Input, InputProps } from './Input';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const [show, setShow] = useState(false);

    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Input
          ref={ref}
          type={show ? 'text' : 'password'}
          style={{ paddingRight: '2.5rem' }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            position: 'absolute',
            right: '0.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem',
            color: 'var(--color-fg-muted)',
          }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
