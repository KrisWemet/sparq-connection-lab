
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type Option = {
  value: string;
  label: string;
};

type QuizQuestionProps = {
  questionText: string;
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
};

export function QuizQuestion({ 
  questionText, 
  options, 
  selectedValue, 
  onValueChange 
}: QuizQuestionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4">{questionText}</h3>
      <RadioGroup
        value={selectedValue}
        onValueChange={onValueChange}
        className="space-y-3"
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2 border p-3 rounded hover:bg-slate-50">
            <RadioGroupItem value={option.value} id={`option-${option.value}`} />
            <Label htmlFor={`option-${option.value}`} className="flex-grow cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
