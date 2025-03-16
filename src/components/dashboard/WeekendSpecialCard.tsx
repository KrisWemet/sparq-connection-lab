
import { motion } from "framer-motion";
import { Sparkles, Zap, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function WeekendSpecialCard() {
  const navigate = useNavigate();
  
  return (
    <motion.div
      initial={{ scale: 1, opacity: 0.9 }}
      animate={{ 
        scale: [1, 1.03, 1],
        opacity: [0.9, 1, 0.9]
      }}
      transition={{ 
        duration: 2, 
        repeat: Infinity, 
        repeatType: "reverse" 
      }}
    >
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-amber-200 bg-gradient-to-br from-amber-50 to-white relative" 
        onClick={() => navigate("/date-ideas")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 p-2 rounded-full">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="font-medium">Weekend Special</h3>
                  <motion.span 
                    className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span>Hurry! Ends Sunday</span>
                    <Zap className="h-3 w-3 ml-1" />
                  </motion.span>
                </div>
                <p className="text-sm text-gray-500">
                  Exclusive fun activity to enjoy together this weekend!
                </p>
              </div>
            </div>
            <motion.div 
              className="h-8 w-8 bg-amber-50 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "rgb(251, 191, 36)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="h-5 w-5 text-amber-500" />
            </motion.div>
          </div>
          
          {/* Decorative elements */}
          <motion.div 
            className="absolute right-0 bottom-0 h-24 w-16 opacity-10"
            style={{ backgroundImage: "url('/placeholder.svg')" }}
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
