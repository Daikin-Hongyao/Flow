import React from 'react';

export const Tag = ({ text }: { text: string }) => (
  <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 whitespace-nowrap">
    {text}
  </span>
);

export const Avatar = ({ name, size = "sm" }: { name: string; size?: "sm" | "md" | "xl" }) => {
  const initials = name ? name[0] : '?';
  let dims = "w-6 h-6 text-xs";
  if (size === "md") dims = "w-8 h-8 text-sm";
  if (size === "xl") dims = "w-24 h-24 text-3xl";

  const colors: Record<string, string> = { 
    'Alex': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200', 
    'Sarah': 'bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200', 
    'Mike': 'bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200', 
    'User': 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200' 
  };
  return (
    <div className={`${dims} rounded-full ${colors[name] || 'bg-gray-100 text-gray-600'} flex items-center justify-center font-medium border border-transparent shadow-sm`}>
      {initials}
    </div>
  );
};