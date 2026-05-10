import type { Digest } from '../../domain';

interface ExecutiveSummaryProps {
  summary: string;
  status: Digest['status'];
}

/**
 * Highlights the AI-generated high-level summary of the digest.
 */
export function ExecutiveSummary({ summary, status }: ExecutiveSummaryProps) {
  return (
    <div className="my-6 border-l-4 border-amber-400 bg-amber-50 p-4 rounded-r-lg shadow-sm">
      <h2 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">
        Executive Summary
      </h2>
      
      {status === 'summarising' ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-amber-200/50 rounded w-full" />
          <div className="h-3 bg-amber-200/50 rounded w-5/6" />
          <div className="h-3 bg-amber-200/50 rounded w-4/6" />
        </div>
      ) : (
        <p className="text-gray-800 italic leading-relaxed text-sm">
          {summary}
        </p>
      )}
    </div>
  );
}
