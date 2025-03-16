
import { motion } from "framer-motion";
import { MessageSquare, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function DailyConnectCard() {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }} 
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 border-primary/20 bg-gradient-to-br from-white to-primary-100 relative" 
        onClick={() => navigate("/quiz")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium flex items-center">
                  Daily Connect 
                  <motion.span 
                    className="ml-1 inline-block text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    New!
                  </motion.span>
                </h3>
                <p className="text-sm text-gray-500">
                  Answer today's fun question to strengthen your bond!
                </p>
              </div>
            </div>
            <motion.div 
              className="h-8 w-8 bg-primary/5 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "var(--primary)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="h-5 w-5 text-primary" />
            </motion.div>
          </div>
          
          {/* Fun animated decoration element */}
          <motion.div 
            className="absolute -right-4 -bottom-4 h-20 w-20 rounded-full bg-primary/5 z-0"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
