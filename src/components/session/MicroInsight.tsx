import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface MicroInsightProps {
  insight: string;
  onContinue: () => void;
}

export function MicroInsight({ insight, onContinue }: MicroInsightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6 text-center space-y-4">
          <span className="text-2xl">✨</span>
          <p className="text-sm font-medium text-primary">Here's what we noticed...</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base text-foreground leading-relaxed"
          >
            {insight}
          </motion.p>
          <Button onClick={onContinue} className="w-full mt-4">
            Continue
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
