
import { motion } from "framer-motion";
import { Users, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SocialProofNotificationProps {
  message: string;
  icon?: "users" | "time";
  type?: "social" | "urgency";
}

export function SocialProofNotification({ 
  message, 
  icon = "users", 
  type = "social" 
}: SocialProofNotificationProps) {
  
  const icons = {
    users: Users,
    time: Clock
  };
  
  const Icon = icons[icon];
  
  const backgrounds = {
    social: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100",
    urgency: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
  };
  
  const iconColors = {
    social: "text-blue-500",
    urgency: "text-amber-500"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className={`${backgrounds[type]} border shadow-sm overflow-hidden`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-full bg-white ${iconColors[type]}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xs text-gray-700 font-medium">{message}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
