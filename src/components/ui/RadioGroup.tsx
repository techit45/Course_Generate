import { forwardRef } from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  ({ name, options, defaultValue, onChange, className = '', ...props }, ref) => {
    return (
      <div className={`grid grid-cols-3 gap-3 ${className}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className="relative cursor-pointer group"
          >
            <input
              ref={ref}
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
              onChange={(e) => onChange?.(e.target.value)}
              className="sr-only peer"
              {...props}
            />
            <div className="px-4 py-3 border border-gray-300 rounded-lg text-center transition-all duration-200 peer-checked:border-login-learning-500 peer-checked:bg-login-learning-50 peer-checked:text-login-learning-700 hover:border-login-learning-300 hover:bg-gray-50 group-hover:shadow-sm">
              <span className="font-medium text-sm">{option.label}</span>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1 peer-checked:text-login-learning-600">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;