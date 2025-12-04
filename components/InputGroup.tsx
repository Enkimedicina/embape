import React from 'react';

interface InputGroupProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  step?: string;
  disabled?: boolean;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  value,
  onChange,
  type = 'number',
  placeholder,
  prefix,
  suffix,
  step = '0.01',
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className={`flex items-center bg-slate-800/60 border ${disabled ? 'border-slate-800 bg-slate-900' : 'border-slate-700 hover:border-slate-500 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500'} rounded-lg transition-all duration-200`}>
        {prefix && (
          <span className="pl-3 text-slate-400 select-none">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          disabled={disabled}
          className="w-full bg-transparent text-slate-100 placeholder-slate-600 px-3 py-2.5 outline-none font-mono text-sm disabled:cursor-not-allowed"
        />
        {suffix && (
          <span className="pr-3 text-slate-400 select-none text-xs font-medium">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};