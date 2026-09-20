import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface InformationFieldProps {
  label: string;
  value: string | null | undefined;
  icon?: React.ElementType;
  multiline?: boolean;
  className?: string;
}

export const InformationField: React.FC<InformationFieldProps> = ({
  label,
  value,
  icon: Icon,
  multiline = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = value && value.trim() ? value.trim() : null;

  const handleCopy = () => {
    if (!displayValue) return;
    navigator.clipboard.writeText(displayValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between group hover:border-slate-300 transition-colors ${className}`}
    >
      <div>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
            {label}
          </span>
          {displayValue && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 rounded-md"
              title="Copy value to clipboard"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>

        {displayValue ? (
          multiline ? (
            <p className="text-sm font-medium text-slate-900 whitespace-pre-line leading-relaxed mt-0.5">
              {displayValue}
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-900 truncate mt-0.5" title={displayValue}>
              {displayValue}
            </p>
          )
        ) : (
          <span className="text-xs font-normal text-slate-400 italic mt-0.5 block">
            Not available
          </span>
        )}
      </div>
    </div>
  );
};
