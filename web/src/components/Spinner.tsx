export const Spinner = ({ label = 'Loading...', size = 'md' }: { label?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  return (
    <div
      role="status"
      style={{
        display: 'inline-block',
        width: sizeMap[size],
        height: sizeMap[size],
        border: '3px solid var(--color-bg-muted)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <span className="sr-only">{label}</span>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
