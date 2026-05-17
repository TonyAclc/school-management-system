import { InputHTMLAttributes, forwardRef } from 'react';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onSearch?: (value: string) => void;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ style, ...props }, ref) => (
    <div style={{ position: 'relative', maxWidth: 320, ...style } as any}>
      <span style={{
        position: 'absolute',
        left: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '1rem',
        opacity: 0.45,
        pointerEvents: 'none',
      }}>
        🔍
      </span>
      <input
        ref={ref}
        type="text"
        style={{
          display: 'block',
          width: '100%',
          padding: '0.5rem 0.75rem 0.5rem 2.25rem',
          fontSize: 'var(--font-size-sm)',
          fontFamily: 'var(--font-sans)',
          color: 'var(--color-fg)',
          backgroundColor: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          transition: 'all var(--duration-fast) var(--easing-standard)',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-accent)';
          e.target.style.boxShadow = 'var(--shadow-focus)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
          e.target.style.boxShadow = 'var(--shadow-xs)';
        }}
        {...props}
      />
    </div>
  )
);

SearchBar.displayName = 'SearchBar';
