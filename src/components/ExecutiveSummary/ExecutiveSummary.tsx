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
    <div className="relative mb-12 animate-fade-in">
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-400 rounded-full opacity-50" />
      <div className="pl-6">
        <span className="inline-block px-3 py-1 mb-4 text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-900 rounded-sm">
          AI Editor's Briefing
        </span>
        
        {status === 'summarising' ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        ) : (
          <h2 className="text-lg md:text-xl font-serif italic leading-relaxed text-gray-800 first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-amber-600">
            {summary}
          </h2>
        )}
      </div>
    </div>
  );
}
