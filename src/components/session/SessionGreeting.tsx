import { motion } from "framer-motion";
import { SparqOtter } from "@/components/SparqOtter";

interface SessionGreetingProps {
  greeting: string;
  subtitle?: string;
  archetype?: string;
}

export function SessionGreeting({ greeting, subtitle }: SessionGreetingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-8"
    >
      <SparqOtter mood="waving" size="lg" className="mb-4" />
      <h1 className="text-2xl font-semibold text-foreground">{greeting}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>
      )}
    </motion.div>
  );
}
