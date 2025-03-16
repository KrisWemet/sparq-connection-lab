
import { motion } from "framer-motion";
import { Activity, ChevronRight, Star, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface RelationshipJourneysCardProps {
  hasSpecialEvent: boolean;
}

export function RelationshipJourneysCard({ hasSpecialEvent }: RelationshipJourneysCardProps) {
  const navigate = useNavigate();
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-blue-50 relative" 
        onClick={() => navigate("/journeys")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium flex items-center">
                  Relationship Journeys
                  {hasSpecialEvent && (
                    <motion.span 
                      className="ml-2 inline-block text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-0.5" />
                        New journey!
                      </span>
                    </motion.span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  Start a guided adventure to strengthen your connection!
                </p>
              </div>
            </div>
            <motion.div 
              className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "rgb(59, 130, 246)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="h-5 w-5 text-blue-600" />
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute -right-6 -bottom-2 opacity-10"
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          >
            <Award className="h-16 w-16 text-blue-700" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
