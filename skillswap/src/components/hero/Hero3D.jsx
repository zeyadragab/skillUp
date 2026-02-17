import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Rocket, Award, Star, BookOpen, GraduationCap } from 'lucide-react';

const HeroSimulated3D = () => {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center overflow-visible">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      
      {/* Central Floating Orb */}
      <motion.div 
        animate={{ 
          y: [0, -40, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 0.95, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative z-10 w-64 h-64 bg-gradient-to-br from-primary via-indigo-500 to-purple-600 rounded-[60px] shadow-2xl flex items-center justify-center transform-gpu preserve-3d"
        style={{ perspective: 1000 }}
      >
        <GraduationCap className="w-32 h-32 text-white drop-shadow-2xl" />
        
        {/* Decorative Inner Rings */}
        <div className="absolute inset-4 border-2 border-white/20 rounded-[45px] animate-ping duration-[3s]" />
      </motion.div>

      {/* Orbiting Elements */}
      {[
        { Icon: Brain, color: "text-blue-500", delay: 0, x: -180, y: -120 },
        { Icon: Award, color: "text-amber-500", delay: 2, x: 200, y: -80 },
        { Icon: Star, color: "text-yellow-400", delay: 1, x: -150, y: 150 },
        { Icon: BookOpen, color: "text-emerald-500", delay: 3, x: 180, y: 150 },
      ].map((item, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ 
            x: item.x, 
            y: item.y, 
            opacity: 1,
            rotateY: [0, 360],
          }}
          transition={{ 
            duration: 1.5,
            delay: item.delay,
            type: "spring",
            stiffness: 50
          }}
          className="absolute z-20"
        >
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: item.delay 
            }}
            className="p-5 bg-white shadow-2xl rounded-2xl border border-border"
          >
            <item.Icon className={`w-8 h-8 ${item.color}`} />
          </motion.div>
        </motion.div>
      ))}

      {/* Particles/Dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            x: [Math.random() * 600 - 300, Math.random() * 600 - 300],
            y: [Math.random() * 600 - 300, Math.random() * 600 - 300],
            opacity: [0, 1, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-2 h-2 bg-primary/30 rounded-full blur-[1px]"
        />
      ))}
    </div>
  );
};

export default HeroSimulated3D;
