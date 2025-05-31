import React from "react";

interface SummaryCardProps {
  title: string;
  value: number | string | React.ReactNode;
  icon?: React.ReactNode;
  color?: string; // e.g. "bg-green-600"
  className?: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  color = "bg-gray-800",
  className = "",
}) => (
  <div
    className={`flex flex-col items-start justify-between rounded-xl p-4 sm:p-5 h-full w-full min-w-0 ${color} ${className}`}
  >
    <div className="flex items-center gap-2 sm:gap-3 mb-2 w-full">
      {icon && (
        <span className="text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="text-xs sm:text-sm md:text-base font-medium text-gray-200 break-words whitespace-normal w-full">
        {title}
      </span>
    </div>
    <span className="text-lg sm:text-xl md:text-2xl font-bold break-words w-full text-center">
      {value}
    </span>
  </div>
);

export default SummaryCard;
