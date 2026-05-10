import { useEffect, useState } from 'react';

interface ScoreBarProps {
  score: number;
}

/**
 * A reusable progress bar that visualizes a relevance score (1-10).
 * Animates from 0 to target width on mount.
 */
export function ScoreBar({ score }: ScoreBarProps) {
  const [width, setWidth] = useState(0);
  
  // Normalized percentage (1-10 -> 10-100%)
  const percentage = Math.min(Math.max(score, 1), 10) * 10;
  
  useEffect(() => {
    // Trigger animation after mount
    const raf = requestAnimationFrame(() => {
      setWidth(percentage);
    });
    return () => cancelAnimationFrame(raf);
  }, [percentage]);

  const colorClass = score >= 7 ? 'bg-green-500' : 'bg-amber-400';

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
          AI Relevance
        </span>
        <span className={`text-[10px] font-bold ${score >= 7 ? 'text-green-600' : 'text-amber-600'}`}>
          {score}/10
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
