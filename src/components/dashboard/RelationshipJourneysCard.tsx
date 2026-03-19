
import { motion } from "framer-motion";
import { Activity, ChevronRight, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from 'next/router';

interface RelationshipJourneysCardProps {
  hasSpecialEvent: boolean;
}

export function RelationshipJourneysCard({ hasSpecialEvent }: RelationshipJourneysCardProps) {
  const router = useRouter();
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card 
        className="cursor-pointer overflow-hidden border border-brand-primary/10 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 relative group" 
        onClick={() => router.push("/journeys")}
      >
        {/* Subtle mesh/blob effect behind */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-brand-sand/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />

        <CardContent className="p-5 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-brand-primary/10 p-2.5 rounded-2xl shadow-sm border border-brand-primary/5">
                <Activity className="h-5 w-5 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-taupe flex items-center">
                  Relationship Journeys
                  {hasSpecialEvent && (
                    <motion.span 
                      className="ml-2 inline-flex text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full font-medium shadow-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-white" />
                        New
                      </span>
                    </motion.span>
                  )}
                </h3>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Start a guided adventure to strengthen your connection!
                </p>
              </div>
            </div>
            <motion.div 
              className="h-9 w-9 bg-brand-primary/5 border border-brand-primary/10 rounded-full flex items-center justify-center shadow-sm"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(192, 97, 74, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="h-5 w-5 text-brand-primary translate-x-0.5" />
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute -right-6 -bottom-4 opacity-[0.03]"
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          >
            <Award className="h-24 w-24 text-brand-primary" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
