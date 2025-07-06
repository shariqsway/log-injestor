import React from "react";

interface LevelFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const LOG_LEVELS: { value: string; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "error", label: "Error" },
  { value: "warn", label: "Warning" },
  { value: "info", label: "Info" },
  { value: "debug", label: "Debug" },
];

export const LevelFilter: React.FC<LevelFilterProps> = ({
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      <label
        htmlFor="level-filter"
        className="text-sm font-medium text-gray-700"
      >
        Log Level
      </label>
      <select
        id="level-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          px-3 py-2 border border-gray-300 rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          text-sm bg-white
        "
      >
        {LOG_LEVELS.map((level) => (
          <option key={level.value} value={level.value}>
            {level.label}
          </option>
        ))}
      </select>
    </div>
  );
};
