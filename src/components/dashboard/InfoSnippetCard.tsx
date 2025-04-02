import React from 'react';
import { cn } from "@/lib/utils"; // Assuming you have a cn utility function

interface InfoSnippetCardProps {
  icon: React.ReactNode;
  title: string;
  content: React.ReactNode;
  containerClassName: string; // e.g., "bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 dark:from-amber-950 dark:to-amber-900 dark:border-amber-800"
  iconContainerClassName: string; // e.g., "bg-amber-100 dark:bg-amber-800"
  iconClassName: string; // e.g., "text-amber-600 dark:text-amber-400"
  className?: string; // Optional additional classes for the root element
}

/**
 * InfoSnippetCard Component
 * Displays a themed information block with an icon, title, and content.
 * Designed to be reusable for snippets like Daily Encouragement, Fun Activity, etc.
 */
export const InfoSnippetCard: React.FC<InfoSnippetCardProps> = ({
  icon,
  title,
  content,
  containerClassName,
  iconContainerClassName,
  iconClassName,
  className,
}) => {
  return (
    <div className={cn("relative rounded-lg p-5", containerClassName, className)}>
      <div className="flex items-start gap-3">
        {/* Icon Section */}
        <div className={cn("p-2 rounded-full mt-1 flex-shrink-0", iconContainerClassName)}>
          {/* Clone the icon element to apply size and color classes without overriding existing ones */}
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, {
            className: cn("w-5 h-5", iconClassName, (icon.props as any).className) // Merge classes
          }) : icon}
        </div>
        {/* Text Content Section */}
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
          {/* Render content directly */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
             {content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSnippetCard;