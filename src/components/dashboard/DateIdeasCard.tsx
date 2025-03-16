
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function DateIdeasCard() {
  const navigate = useNavigate();
  
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
      <Card 
        className="cursor-pointer overflow-hidden hover:shadow-md transition-all duration-300 bg-gradient-to-br from-white to-green-50 relative" 
        onClick={() => navigate("/date-ideas")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-green-100 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Fun Date Ideas</h3>
                <p className="text-sm text-gray-500">
                  Discover new exciting activities to enjoy together!
                </p>
              </div>
            </div>
            <motion.div 
              className="h-8 w-8 bg-green-50 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, backgroundColor: "rgb(34, 197, 94)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <ChevronRight className="h-5 w-5 text-green-600" />
            </motion.div>
          </div>
          
          {/* Fun animated decoration */}
          <motion.div 
            className="absolute right-4 bottom-0 opacity-10"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Smile className="h-10 w-10 text-green-800" />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
