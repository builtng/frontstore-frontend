'use client';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  id?: string;
}

export default function Toggle({ checked, onChange, disabled, label, id }: ToggleProps) {
  const track = (
    <span
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: 36,
        height: 20,
        flexShrink: 0,
        borderRadius: 999,
        background: checked ? 'var(--primary)' : 'var(--border-strong)',
        transition: 'background var(--t-normal, .2s) var(--ease, ease)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
          transition: 'left var(--t-normal, .2s) var(--ease, ease)',
        }}
      />
    </span>
  );

  if (!label) return track;

  return (
    <label
      htmlFor={id}
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', userSelect: 'none' }}
    >
      {track}
      <span>{label}</span>
    </label>
  );
}
