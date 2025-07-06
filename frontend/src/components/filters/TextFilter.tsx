import React from "react";

interface TextFilterProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const TextFilter: React.FC<TextFilterProps> = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          px-3 py-2 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          text-sm placeholder-gray-400
        "
      />
    </div>
  );
};
