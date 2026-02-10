import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { LearnStep as LearnStepType, SessionQuestion, MCOption } from "@/types/session";

interface LearnStepProps {
  learn: LearnStepType;
  onAnswer: (value: string, selectedOption?: MCOption) => void;
  isAnalyzing: boolean;
}

export function LearnStep({ learn, onAnswer, isAnalyzing }: LearnStepProps) {
  const { question, insight } = learn;
  const [selectedOption, setSelectedOption] = useState<MCOption | null>(null);
  const [textValue, setTextValue] = useState("");
  const [scaleValue, setScaleValue] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleMCSelect = (option: MCOption) => {
    if (submitted) return;
    setSelectedOption(option);

    // Auto-submit after 0.5s
    setTimeout(() => {
      setSubmitted(true);
      onAnswer(option.id, option);
    }, 500);
  };

  const handleOpenEndedSubmit = () => {
    if (!textValue.trim() || submitted) return;
    setSubmitted(true);
    onAnswer(textValue);
  };

  const handleScaleSelect = (value: number) => {
    if (submitted) return;
    setScaleValue(value);

    // Auto-submit after 0.3s
    setTimeout(() => {
      setSubmitted(true);
      onAnswer(value.toString());
    }, 300);
  };

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTextValue("");
    setScaleValue(null);
    setSubmitted(false);
  }, [question.id]);

  const renderQuestionInput = () => {
    if (question.format === "multiple-choice" && question.options) {
      return (
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => handleMCSelect(option)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedOption?.id === option.id
                  ? "bg-primary/5"
                  : "hover:border-primary/50"
              } ${submitted ? "cursor-default opacity-70" : "cursor-pointer"}`}
              style={{
                borderColor: selectedOption?.id === option.id 
                  ? "var(--session-primary, hsl(var(--primary)))" 
                  : "hsl(var(--border))",
              }}
            >
              <span className="text-sm">{option.text}</span>
            </motion.button>
          ))}
        </div>
      );
    }

    if (question.format === "open-ended") {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="What's coming up for you?"
            disabled={submitted}
            className="w-full rounded-lg border p-3 min-h-[100px] resize-none focus:ring-2 focus:ring-primary/30 focus:outline-none bg-background text-foreground"
          />
          <Button
            onClick={handleOpenEndedSubmit}
            disabled={!textValue.trim() || submitted}
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>
      );
    }

    if (question.format === "scale") {
      const scaleMin = question.scaleMin ?? 1;
      const scaleMax = question.scaleMax ?? 5;
      const scaleLabels = question.scaleLabels ?? ["Not at all", "Very much"];
      const scalePoints = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i);

      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground">{scaleLabels[0]}</span>
            <div className="flex gap-2">
              {scalePoints.map((value) => (
                <button
                  key={value}
                  onClick={() => handleScaleSelect(value)}
                  disabled={submitted}
                  className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                    scaleValue === value
                      ? "text-white"
                      : "hover:border-primary/50"
                  } ${submitted ? "cursor-default opacity-70" : "cursor-pointer"}`}
                  style={{
                    backgroundColor: scaleValue === value 
                      ? "var(--session-primary, hsl(var(--primary)))" 
                      : "transparent",
                    borderColor: scaleValue === value 
                      ? "var(--session-primary, hsl(var(--primary)))" 
                      : "hsl(var(--border))",
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{scaleLabels[1]}</span>
          </div>
        </motion.div>
      );
    }

    // Ranking format (fallback as open-ended)
    if (question.format === "ranking" && question.rankingItems) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="text-sm text-muted-foreground space-y-2">
            <p>Rank these items in order of importance to you:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              {question.rankingItems.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder="Type your ranking (e.g., 3, 1, 2, 4)..."
            disabled={submitted}
            className="w-full rounded-lg border p-3 min-h-[80px] resize-none focus:ring-2 focus:ring-primary/30 focus:outline-none bg-background text-foreground"
          />
          <Button
            onClick={handleOpenEndedSubmit}
            disabled={!textValue.trim() || submitted}
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Insight text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0 }}
        className="text-sm text-muted-foreground italic"
      >
        {insight}
      </motion.p>

      {/* Question text */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium"
      >
        {question.text}
      </motion.h2>

      {/* Question input based on format */}
      <div style={{
        padding: "1rem",
        borderRadius: "0.75rem",
        background: "var(--archetype-glow, transparent)",
      }}>
        {renderQuestionInput()}
      </div>

      {/* Loading indicator when analyzing */}
      {isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-4"
        >
          <div 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: "var(--session-primary, hsl(var(--primary)))" }}
          />
          <span>As we reflect on what you shared...</span>
        </motion.div>
      )}
    </motion.div>
  );
}
