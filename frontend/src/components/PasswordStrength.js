'use client';
import { Check, X } from 'lucide-react';

const PasswordStrength = ({ password }) => {
  const getStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const segments = [
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-orange-500' },
    { label: 'Good', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-green-500' }
  ];

  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'At least one uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'At least one number', met: /[0-9]/.test(password) }
  ];

  return (
    <div className="mt-2 space-y-3">
      {/* Strength Bar */}
      <div className="flex gap-1 h-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-500 ${
              i < strength ? segments[strength - 1].color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      
      {/* Label */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Strength</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${strength > 0 ? segments[strength - 1].color.replace('bg-', 'text-') : 'text-foreground/20'}`}>
          {strength > 0 ? segments[strength - 1].label : 'Too Short'}
        </span>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2">
            {check.met ? (
              <Check size={12} className="text-green-500" />
            ) : (
              <X size={12} className="text-foreground/20" />
            )}
            <span className={`text-xs ${check.met ? 'text-foreground/80' : 'text-foreground/40'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
