import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export interface ReflectionInputProps {
  prompt: string;
  value: string;
  onChange: (text: string) => void;
  minLength?: number;
}

export function ReflectionInput({ 
  prompt, 
  value, 
  onChange, 
  minLength = 10 
}: ReflectionInputProps) {
  const [text, setText] = useState<string>(value || "");
  const [saving, setSaving] = useState<boolean>(false);
  
  // Update local state when prop value changes
  useEffect(() => {
    setText(value || "");
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  const handleSave = async () => {
    if (text.trim().length < minLength) return;
    
    setSaving(true);
    
    try {
      await onChange(text);
    } catch (error) {
      console.error("Error saving reflection:", error);
    } finally {
      setSaving(false);
    }
  };
  
  const isValid = text.trim().length >= minLength;
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Your Reflection
      </h2>
      
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="italic text-gray-700 dark:text-gray-300 mb-1">
          {prompt}
        </p>
      </div>
      
      <div className="space-y-4">
        <Textarea
          placeholder="Write your reflection here..."
          className="min-h-[150px] resize-y"
          value={text}
          onChange={handleChange}
        />
        
        <div className="flex justify-between items-center">
          <p className={`text-sm ${isValid ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {text.length} characters
            {!isValid && ` (minimum ${minLength})`}
          </p>
          
          <Button 
            onClick={handleSave} 
            disabled={!isValid || saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Reflection
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 