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
    >
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg font-medium">How did it go?</CardTitle>
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
                    className="h-auto py-3 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
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
