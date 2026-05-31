import { useEffect, useState } from 'react';

interface ScoreBarProps {
  score: number;
}

/**
 * A reusable progress bar that visualizes relevance as a percentage (0-100%).
 * Handles 0-1, 1-10, and 0-100 input ranges automatically.
 */
export function ScoreBar({ score }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  
  // Logic to determine the percentage:
  let displayPercentage = 0;
  
  if (score > 10) {
    // Already 0-100 scale
    displayPercentage = score;
  } else if (score > 1) {
    // 1-10 scale -> convert to percentage
    displayPercentage = score * 10;
  } else {
    // 0-1 scale -> convert to percentage
    displayPercentage = score * 100;
  }
  
  // Clamp between 0 and 100
  const finalPercentage = Math.min(Math.max(displayPercentage, 0), 100);
  
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setWidth(finalPercentage);
    });
    return () => cancelAnimationFrame(raf);
  }, [finalPercentage]);

  // Editorial color palette
  const colorClass = finalPercentage >= 80 ? 'bg-amber-500' : 'bg-amber-400/60';

  return (
    <div className="w-full">
      <div className="flex justify-end mb-1">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
          {Math.round(finalPercentage)}% Match
        </span>
      </div>
      <div className="h-1 w-full bg-gray-200/50 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
