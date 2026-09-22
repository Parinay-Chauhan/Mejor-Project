import React, { useMemo } from "react";

const StarsBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, () => ({
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      opacity: Math.random(),
    }));
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#000000]">
      {stars.map((star, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            boxShadow:
              star.size > 2
                ? "0 0 8px rgba(255,255,255,0.8)"
                : "0 0 4px rgba(255,255,255,0.4)",
          }}
        />
      ))}
    </div>
  );
};

export default StarsBackground;