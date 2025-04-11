import React from "react";
import { ExternalLink } from "lucide-react";

interface ContentBlockProps {
  block: {
    type: 'text' | 'video' | 'exercise' | 'link';
    value: string;
  };
}

export function ContentBlockRenderer({ block }: ContentBlockProps) {
  switch (block.type) {
    case 'text':
      return <p className="text-gray-700 dark:text-gray-300">{block.value}</p>;
      
    case 'video':
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={block.value}
            className="w-full h-full"
            title="Video content"
            allowFullScreen
          />
        </div>
      );
      
    case 'exercise':
      return (
        <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg">
          <h3 className="font-medium text-primary dark:text-primary-foreground mb-2">Exercise</h3>
          <p className="text-gray-700 dark:text-gray-300">{block.value}</p>
        </div>
      );
      
    case 'link':
      return (
        <a 
          href={block.value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 dark:text-blue-400 flex items-center hover:underline"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          {block.value}
        </a>
      );
      
    default:
      return <p className="text-gray-700 dark:text-gray-300">{block.value}</p>;
  }
} 