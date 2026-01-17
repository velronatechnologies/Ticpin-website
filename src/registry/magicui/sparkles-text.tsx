"use client";

import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesTextProps {
  children: string;
  className?: string;
  sparklesCount?: number;
  colors?: {
    first: string;
    second: string;
  };
}

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

export function SparklesText({
  children,
  className,
  sparklesCount = 10,
  colors = {
    first: "#9E7AFF",
    second: "#FE8BBB",
  },
}: SparklesTextProps): ReactElement {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateStar = (): Sparkle => {
      return {
        id: `sparkle-${Date.now()}-${Math.random()}`,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        color: Math.random() > 0.5 ? colors.first : colors.second,
        delay: Math.random() * 2,
        scale: Math.random() * 1 + 0.3,
        lifespan: Math.random() * 10 + 5,
      };
    };

    const initializeStars = () => {
      return Array.from({ length: sparklesCount }, generateStar);
    };

    setSparkles(initializeStars());

    const interval = setInterval(() => {
      setSparkles((currentSparkles) => {
        return currentSparkles.map((sparkle) => {
          if (Math.random() > 0.8) {
            return generateStar();
          }
          return sparkle;
        });
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [colors.first, colors.second, sparklesCount]);

  return (
    <span
      className={cn("relative inline-block px-2", className)}
      style={
        {
          "--sparkles-first-color": colors.first,
          "--sparkles-second-color": colors.second,
        } as CSSProperties
      }
    >
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 -inset-x-4 -inset-y-2 pointer-events-none" aria-hidden="true">
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle} />
        ))}
      </span>
    </span>
  );
}

function Sparkle({
  x,
  y,
  color,
  delay,
  scale,
  lifespan,
}: Omit<Sparkle, "id">): ReactElement {
  return (
    <svg
      className="absolute animate-sparkle pointer-events-none"
      style={
        {
          left: x,
          top: y,
          animationDelay: `${delay}s`,
          animationDuration: `${lifespan}s`,
          transform: `scale(${scale})`,
          transformOrigin: "center",
        } as CSSProperties
      }
      width="16"
      height="16"
      viewBox="0 0 21 21"
    >
      <path
        d="M9.82531 0.843845C10.0553 0.215178 10.9446 0.215178 11.1746 0.843845L11.8618 2.72026C12.4006 4.19229 13.3084 5.50035 14.4916 6.51122C15.6747 7.52209 17.0934 8.20413 18.6146 8.4894L20.5558 8.83858C21.1974 8.94628 21.1974 9.82725 20.5558 9.93495L18.6146 10.2841C17.0934 10.5694 15.6747 11.2514 14.4916 12.2623C13.3084 13.2732 12.4006 14.5812 11.8618 16.0533L11.1746 17.9297C10.9446 18.5583 10.0553 18.5583 9.82531 17.9297L9.13813 16.0533C8.59932 14.5812 7.69146 13.2732 6.50834 12.2623C5.32521 11.2514 3.90649 10.5694 2.38528 10.2841L0.444101 9.93495C-0.197437 9.82725 -0.197437 8.94628 0.444101 8.83858L2.38528 8.4894C3.90649 8.20413 5.32521 7.52209 6.50834 6.51122C7.69146 5.50035 8.59932 4.19229 9.13813 2.72026L9.82531 0.843845Z"
        fill={color}
      />
    </svg>
  );
}
