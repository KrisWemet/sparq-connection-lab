import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { YesterdayCheckIn as YesterdayCheckInType, CheckInResponseId } from "@/types/session";

interface YesterdayCheckInProps {
  checkIn: YesterdayCheckInType;
  onResponse: (responseId: CheckInResponseId) => void;
}

export function YesterdayCheckIn({ checkIn, onResponse }: YesterdayCheckInProps) {
  const [selected, setSelected] = useState<CheckInResponseId | null>(null);

  const handleSelect = (id: CheckInResponseId) => {
    setSelected(id);
    onResponse(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: "var(--archetype-glow, transparent)",
        borderRadius: "0.75rem",
        padding: "0.5rem",
      }}
    >
      <Card 
        className="bg-muted/30"
        style={{
          borderColor: "var(--session-primary, hsl(var(--border)))",
        }}
      >
        <CardHeader>
          <CardTitle
            className="text-lg font-medium"
            style={{ color: "var(--session-primary, hsl(var(--card-foreground)))" }}
          >
            As you look back...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground italic">
            {checkIn.actionReminder}
          </p>

          <AnimatePresence mode="wait">
            {selected === null ? (
              <motion.div
                key="options"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 gap-3"
              >
                {checkIn.responseOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant="outline"
                    className="h-auto py-3 flex flex-col items-center justify-center gap-1"
                    style={{
                      ['--tw-bg-opacity' as string]: '0.1',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--session-primary, hsl(var(--primary)))";
                      e.currentTarget.style.backgroundColor = "var(--session-surface, hsl(var(--primary) / 0.1))";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                      e.currentTarget.style.backgroundColor = "";
                    }}
                    onClick={() => handleSelect(option.id)}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-sm">{option.label}</span>
                  </Button>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="acknowledgment"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-sm text-muted-foreground p-4 bg-background/50 rounded-lg"
              >
                {checkIn.acknowledgments[selected]}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
