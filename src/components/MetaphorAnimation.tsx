import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Sparkles } from "lucide-react";

export interface MetaphorAnimationProps {
  title: string;
  description: string;
  metaphorType: "flower" | "bridge" | "tree" | "river" | "flame";
  onComplete: () => void;
}

// Define type for metaphor styles
interface MetaphorStyle {
  primary: string;
  secondary: string;
  background: string;
  border: string;
}

// Define type for stage messages
interface StageMessages {
  [key: string]: string[];
}

export function MetaphorAnimation({
  title,
  description,
  metaphorType,
  onComplete
}: MetaphorAnimationProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  // Auto-advance animation stages
  useEffect(() => {
    if (animationStage < 3 && !isComplete) {
      const timer = setTimeout(() => {
        setAnimationStage(prev => prev + 1);
      }, 3000); // Advance every 3 seconds
      
      return () => clearTimeout(timer);
    } else if (animationStage === 3 && !isComplete) {
      const timer = setTimeout(() => {
        setIsComplete(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [animationStage, isComplete]);
  
  // Metaphor-specific colors and animations
  const metaphorStyles: Record<string, MetaphorStyle> = {
    flower: {
      primary: "from-pink-500 to-rose-500",
      secondary: "text-rose-600",
      background: "bg-gradient-to-br from-rose-50 to-pink-50",
      border: "border-rose-200"
    },
    bridge: {
      primary: "from-blue-500 to-indigo-500",
      secondary: "text-blue-600",
      background: "bg-gradient-to-br from-blue-50 to-indigo-50",
      border: "border-blue-200"
    },
    tree: {
      primary: "from-green-500 to-emerald-500",
      secondary: "text-green-600",
      background: "bg-gradient-to-br from-green-50 to-emerald-50",
      border: "border-green-200"
    },
    river: {
      primary: "from-cyan-500 to-blue-500",
      secondary: "text-cyan-600",
      background: "bg-gradient-to-br from-cyan-50 to-blue-50",
      border: "border-cyan-200"
    },
    flame: {
      primary: "from-amber-500 to-red-500",
      secondary: "text-amber-600",
      background: "bg-gradient-to-br from-amber-50 to-red-50",
      border: "border-amber-200"
    }
  };
  
  // Metaphor-specific messages for each stage
  const stageMessages: Record<string, string[]> = {
    flower: [
      "Like a flower, relationships need nurturing to grow...",
      "Each petal represents a different aspect of your connection...",
      "As you tend to your relationship, notice how it blossoms...",
      "Your relationship continues to bloom with each moment of care."
    ],
    bridge: [
      "A bridge connects two separate places...",
      "Building a strong foundation ensures stability...",
      "Each plank represents a moment of understanding...",
      "Your connection forms a bridge that withstands life's challenges."
    ],
    tree: [
      "Like a tree, your relationship has deep roots...",
      "It grows stronger with time, reaching higher...",
      "Branches extend in new directions as you grow together...",
      "Your relationship provides shelter and support through all seasons."
    ],
    river: [
      "Your relationship flows like a river, always in motion...",
      "Sometimes calm, sometimes rapid, but always moving forward...",
      "Two streams joining to form something more powerful...",
      "Together, you navigate the journey, finding your shared path."
    ],
    flame: [
      "A flame represents the passion in your relationship...",
      "It requires attention to maintain its warmth and light...",
      "The dance of the flame shows the dynamic nature of your connection...",
      "Your shared energy continues to illuminate your path together."
    ]
  };
  
  // Render the appropriate animation based on metaphor type
  const renderAnimation = () => {
    switch (metaphorType) {
      case "flower":
        return <FlowerAnimation stage={animationStage} />;
      case "bridge":
        return <BridgeAnimation stage={animationStage} />;
      case "tree":
        return <TreeAnimation stage={animationStage} />;
      case "river":
        return <RiverAnimation stage={animationStage} />;
      case "flame":
        return <FlameAnimation stage={animationStage} />;
      default:
        return <FlowerAnimation stage={animationStage} />;
    }
  };
  
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className={`relative max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${metaphorStyles[metaphorType].background} ${metaphorStyles[metaphorType].border} border`}>
        <div className="text-center mb-6">
          <motion.h2 
            className="text-xl font-bold mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {title}
          </motion.h2>
          
          <motion.p
            className="text-sm text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {description}
          </motion.p>
        </div>
        
        <div className="flex justify-center mb-6">
          {renderAnimation()}
        </div>
        
        <motion.div
          className="text-center mb-6"
          key={animationStage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className={`text-base italic ${metaphorStyles[metaphorType].secondary}`}>
            {stageMessages[metaphorType][animationStage]}
          </p>
        </motion.div>
        
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <Button
              onClick={onComplete}
              className={`bg-gradient-to-r ${metaphorStyles[metaphorType].primary} text-white`}
            >
              Continue Your Journey
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// Animation components for each metaphor type
interface AnimationProps {
  stage: number;
}

function FlowerAnimation({ stage }: AnimationProps) {
  return (
    <div className="relative h-48 w-48">
      {/* Center of flower */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-yellow-400"
        initial={{ scale: 0 }}
        animate={{ scale: stage >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      />
      
      {/* Petals */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-16 h-8 bg-pink-400 rounded-full origin-left"
          style={{ 
            rotate: `${i * 45}deg`,
            transformOrigin: "left center"
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ 
            scaleX: stage >= 1 ? 1 : 0, 
            opacity: stage >= 1 ? 1 : 0 
          }}
          transition={{ 
            duration: 0.5, 
            delay: 0.1 * i,
            type: "spring"
          }}
        />
      ))}
      
      {/* Stem */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-2 h-40 bg-green-500"
        style={{ 
          transformOrigin: "top center",
          rotate: "90deg",
          top: "75%",
          left: "50%"
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 2 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      
      {/* Leaves */}
      <motion.div
        className="absolute w-10 h-5 bg-green-400 rounded-full origin-left"
        style={{ 
          top: "75%",
          left: "40%",
          rotate: "30deg"
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: stage >= 3 ? 1 : 0,
          opacity: stage >= 3 ? 1 : 0
        }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      
      <motion.div
        className="absolute w-10 h-5 bg-green-400 rounded-full origin-right"
        style={{ 
          top: "80%",
          left: "60%",
          rotate: "-30deg"
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: stage >= 3 ? 1 : 0,
          opacity: stage >= 3 ? 1 : 0
        }}
        transition={{ duration: 0.5, delay: 0.4 }}
      />
    </div>
  );
}

function BridgeAnimation({ stage }: AnimationProps) {
  return (
    <div className="relative h-48 w-64">
      {/* Water */}
      <motion.div
        className="absolute bottom-0 w-full h-12 bg-blue-300 rounded-t-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Water ripples */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-2 h-1 bg-blue-200 rounded-full"
            style={{ 
              left: `${10 + i * 20}%`,
              width: "30%" 
            }}
            animate={{ 
              opacity: [0.5, 1, 0.5],
              x: [0, 10, 0]
            }}
            transition={{ 
              duration: 3, 
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </motion.div>
      
      {/* Bridge pillars */}
      <motion.div
        className="absolute bottom-12 left-4 w-6 h-20 bg-gray-700 rounded-t-lg"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
        style={{ transformOrigin: "bottom" }}
      />
      
      <motion.div
        className="absolute bottom-12 right-4 w-6 h-20 bg-gray-700 rounded-t-lg"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        style={{ transformOrigin: "bottom" }}
      />
      
      {/* Bridge span */}
      <motion.div
        className="absolute top-16 w-full h-4 bg-gray-600"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: stage >= 2 ? 1 : 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{ transformOrigin: "center" }}
      />
      
      {/* Bridge railings */}
      <motion.div
        className="absolute top-12 w-full h-4 bg-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 3 ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      />
      
      {/* People crossing */}
      {stage >= 3 && (
        <>
          <motion.div
            className="absolute top-12 w-3 h-6 bg-red-500 rounded-full"
            initial={{ x: 10 }}
            animate={{ x: 50 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          
          <motion.div
            className="absolute top-12 w-3 h-6 bg-blue-500 rounded-full"
            initial={{ x: 50 }}
            animate={{ x: 10 }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </>
      )}
    </div>
  );
}

interface TreeStylesProps {
  trunk: React.CSSProperties;
  leftRoot: React.CSSProperties;
  rightRoot: React.CSSProperties;
  leftBranch1: React.CSSProperties;
  leftBranch2: React.CSSProperties;
  rightBranch1: React.CSSProperties;
  rightBranch2: React.CSSProperties;
  topLeaf: React.CSSProperties;
  leftLeaf1: React.CSSProperties;
  rightLeaf1: React.CSSProperties;
  leftLeaf2: React.CSSProperties;
  rightLeaf2: React.CSSProperties;
}

function TreeAnimation({ stage }: AnimationProps) {
  const treeStyles: TreeStylesProps = {
    trunk: {
      height: "60%",
      backgroundColor: "#8B4513", // brown color
      transformOrigin: "bottom"
    },
    leftRoot: {
      backgroundColor: "#8B4513",
      transformOrigin: "right center",
      rotate: "30deg"
    },
    rightRoot: {
      backgroundColor: "#8B4513",
      transformOrigin: "left center",
      rotate: "-30deg"
    },
    leftBranch1: {
      backgroundColor: "#8B4513",
      top: "30%",
      left: "50%",
      transformOrigin: "left center",
      rotate: "-30deg"
    },
    leftBranch2: {
      backgroundColor: "#8B4513",
      top: "40%",
      left: "50%",
      transformOrigin: "left center",
      rotate: "-15deg"
    },
    rightBranch1: {
      backgroundColor: "#8B4513",
      top: "30%",
      right: "50%",
      transformOrigin: "right center",
      rotate: "30deg"
    },
    rightBranch2: {
      backgroundColor: "#8B4513",
      top: "40%",
      right: "50%",
      transformOrigin: "right center",
      rotate: "15deg"
    },
    topLeaf: {
      top: "5%",
      left: "50%",
      transform: "translateX(-50%)"
    },
    leftLeaf1: {
      top: "15%",
      left: "25%"
    },
    rightLeaf1: {
      top: "15%",
      right: "25%"
    },
    leftLeaf2: {
      top: "30%",
      left: "20%"
    },
    rightLeaf2: {
      top: "30%",
      right: "20%"
    }
  };

  return (
    <div className="relative h-48 w-48">
      {/* Trunk */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 bg-brown-600"
        style={treeStyles.trunk}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Roots */}
      {stage >= 1 && (
        <>
          <motion.div
            className="absolute bottom-0 left-1/3 w-16 h-3"
            style={treeStyles.leftRoot}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          <motion.div
            className="absolute bottom-0 right-1/3 w-16 h-3"
            style={treeStyles.rightRoot}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
        </>
      )}
      
      {/* Main branches */}
      {stage >= 2 && (
        <>
          <motion.div
            className="absolute w-20 h-4"
            style={treeStyles.leftBranch1}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          <motion.div
            className="absolute w-20 h-4"
            style={treeStyles.leftBranch2}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          <motion.div
            className="absolute w-20 h-4"
            style={treeStyles.rightBranch1}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          
          <motion.div
            className="absolute w-20 h-4"
            style={treeStyles.rightBranch2}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </>
      )}
      
      {/* Leaves/Foliage */}
      {stage >= 3 && (
        <>
          <motion.div
            className="absolute w-24 h-24 bg-green-500 rounded-full opacity-80"
            style={treeStyles.topLeaf}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          
          <motion.div
            className="absolute w-20 h-20 bg-green-500 rounded-full opacity-80"
            style={treeStyles.leftLeaf1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          
          <motion.div
            className="absolute w-20 h-20 bg-green-500 rounded-full opacity-80"
            style={treeStyles.rightLeaf1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          
          <motion.div
            className="absolute w-16 h-16 bg-green-500 rounded-full opacity-80"
            style={treeStyles.leftLeaf2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
          
          <motion.div
            className="absolute w-16 h-16 bg-green-500 rounded-full opacity-80"
            style={treeStyles.rightLeaf2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
        </>
      )}
    </div>
  );
}

interface TreeStyles {
  tree1: React.CSSProperties;
  tree2: React.CSSProperties;
  tree3: React.CSSProperties;
}

function RiverAnimation({ stage }: AnimationProps) {
  const treeStyles: TreeStyles = {
    tree1: {
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      backgroundColor: "green",
      transformOrigin: "bottom"
    },
    tree2: {
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      backgroundColor: "green",
      transformOrigin: "bottom"
    },
    tree3: {
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "50%",
      backgroundColor: "green",
      transformOrigin: "bottom"
    }
  };

  return (
    <div className="relative h-48 w-64">
      {/* River bed */}
      <motion.div
        className="absolute bottom-0 w-full h-16 bg-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* River water */}
      <motion.div
        className="absolute bottom-0 w-full h-12 bg-blue-400 opacity-80"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        style={{ transformOrigin: "left" }}
      >
        {/* Water ripples */}
        {stage >= 1 && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 bg-blue-300 rounded-full"
            style={{ 
              top: `${3 + (i % 3) * 3}px`,
              width: "20px",
              left: "-20px"
            }}
            animate={{ 
              x: [0, 300]
            }}
            transition={{ 
              duration: 3 - (i % 3) * 0.5, 
              delay: i * 0.2,
              repeat: Infinity,
              repeatDelay: (i % 2) * 0.2
            }}
          />
        ))}
      </motion.div>
      
      {/* Banks/Shores */}
      {stage >= 2 && (
        <>
          <motion.div
            className="absolute bottom-12 left-0 w-full h-4 bg-green-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          
          <motion.div
            className="absolute bottom-16 left-0 w-full h-32 bg-green-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </>
      )}
      
      {/* Trees and elements on the shore */}
      {stage >= 3 && (
        <>
          <motion.div
            className="absolute bottom-16 left-6 w-8 h-16"
            style={treeStyles.tree1}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          
          <motion.div
            className="absolute bottom-16 right-10 w-8 h-16"
            style={treeStyles.tree2}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          
          <motion.div
            className="absolute bottom-16 right-24 w-6 h-12"
            style={treeStyles.tree3}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </>
      )}
    </div>
  );
}

interface FlameStyles {
  base: React.CSSProperties;
  mainFlame: React.CSSProperties;
  innerFlame: React.CSSProperties;
  coreFlame: React.CSSProperties;
  flicker: React.CSSProperties;
}

function FlameAnimation({ stage }: AnimationProps) {
  const flameStyles: FlameStyles = {
    base: {
      transformOrigin: "bottom"
    },
    mainFlame: {
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      transformOrigin: "bottom"
    },
    innerFlame: {
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      transformOrigin: "bottom"
    },
    coreFlame: {
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      transformOrigin: "bottom"
    },
    flicker: {
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      transformOrigin: "bottom"
    }
  };

  return (
    <div className="relative h-48 w-48">
      {/* Base of flame */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-amber-600 rounded-full"
        style={flameStyles.base}
        initial={{ scale: 0 }}
        animate={{ scale: stage >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Main flame body */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-12 h-24 bg-amber-500"
        style={flameStyles.mainFlame}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 1 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      
      {/* Inner flame */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-20 bg-yellow-400"
        style={flameStyles.innerFlame}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 2 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
      
      {/* Flame core */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-12 bg-white"
        style={flameStyles.coreFlame}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: stage >= 3 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />
      
      {/* Flame flicker animation */}
      {stage >= 2 && (
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-14 h-26 bg-amber-400 opacity-40"
          style={flameStyles.flicker}
          animate={{ 
            scaleY: [1, 1.1, 0.9, 1],
            scaleX: [1, 0.9, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}
      
      {/* Sparks */}
      {stage >= 3 && [...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-yellow-300"
          style={{ 
            bottom: "40%",
            left: "50%"
          }}
          animate={{ 
            x: [0, (i % 2 === 0 ? 20 : -20) + (i * 5)],
            y: [-30 - (i * 10)],
            opacity: [1, 0]
          }}
          transition={{ 
            duration: 1 + (i * 0.2),
            repeat: Infinity,
            repeatDelay: i * 0.3
          }}
        />
      ))}
    </div>
  );
} 