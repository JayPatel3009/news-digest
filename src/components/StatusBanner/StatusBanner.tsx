import { Digest } from '../../domain';

interface StatusBannerProps {
  status: Digest['status'];
  error: string | null;
}

/**
 * Displays current generation status or error messages to the user.
 */
export function StatusBanner({ status, error }: StatusBannerProps) {
  if (status === 'idle' || status === 'ready') {
    return null;
  }

  if (status === 'error') {
    return (
      <div className="my-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
        <p className="font-semibold">Generation Failed</p>
        <p>{error || 'An unknown error occurred.'} Please try again.</p>
      </div>
    );
  }

  const message =
    status === 'fetching'
      ? 'Fetching headlines across your topics...'
      : 'Gemini is reading and ranking your articles...';

  return (
    <div className="my-4 flex items-center gap-3 p-4 rounded-lg bg-violet-50 border border-violet-100 text-violet-800 text-sm">
      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
      <p className="font-medium animate-pulse">{message}</p>
    </div>
  );
}
