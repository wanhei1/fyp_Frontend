"use client";

import { useState, useEffect } from "react";
import IceFlake from "./ice-flake";

export default function IceFlakesContainer() {
  const [flakes, setFlakes] = useState([]);

  // Generate flakes only on the client side to avoid hydration mismatch
  useEffect(() => {
    // Generate random positions for ice flakes
    const generatedFlakes = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 20 + 10,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: Math.random() * 20 + 10,
      opacity: Math.random() * 0.3 + 0.1,
    }));
    setFlakes(generatedFlakes);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {flakes.map((flake) => (
        <IceFlake
          key={flake.id}
          size={flake.size}
          top={flake.top}
          left={flake.left}
          delay={flake.delay}
          duration={flake.duration}
          opacity={flake.opacity}
        />
      ))}
    </div>
  );
}
