import { useDigest } from '../../hooks/useDigest';
import { useTopics } from '../../hooks/useTopics';
import { useAudioBriefing } from '../../hooks/useAudioBriefing';
import { useDigestStore } from '../../store/digestStore';
import { copyBriefingToClipboard, shareBriefing } from '../../utils/exportBriefing';
import { useState } from 'react';

/**
 * Header for the generated digest, showing the date, active topics, audio player, export options, bookmarks filter, and refresh action.
 */
export function DigestHeader() {
  const { digest, generate, status } = useDigest();
  const { activeTopics } = useTopics();
  const { isSupported, isPlaying, isPaused, play, pause, resume, stop } = useAudioBriefing();
  const { bookmarks, showBookmarksOnly, setShowBookmarksOnly } = useDigestStore();
  const [copied, setCopied] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('en-NZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  const isLoading = status === 'fetching' || status === 'summarising';

  const handlePlayAudio = () => {
    if (!digest) return;
    const topItems = digest.items.slice(0, 5);
    const headlinesText = topItems
      .map((item, idx) => `Story ${idx + 1}: ${item.article.title}. ${item.aiReason}`)
      .join('. ');

    const script = `Here is your daily news briefing for ${formattedDate}. Summary: ${digest.executiveSummary}. In top stories: ${headlinesText}. That concludes your briefing.`;
    play(script);
  };

  const handleCopy = async () => {
    if (!digest) return;
    const success = await copyBriefingToClipboard(digest, formattedDate);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (!digest) return;
    await shareBriefing(digest, formattedDate);
  };

  return (
    <div className="mb-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-amber-600 uppercase tracking-[0.2em]">
            {formattedDate}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {activeTopics.map((topic) => (
              <span 
                key={topic.id}
                className="text-[10px] font-bold text-gray-900 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-sm"
              >
                {topic.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Saved Stories Filter Toggle */}
          {bookmarks.length > 0 && (
            <button
              type="button"
              onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
              className={`text-xs px-3.5 py-1.5 rounded-full border transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                showBookmarksOnly
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>★</span>
              <span>Saved Stories ({bookmarks.length})</span>
            </button>
          )}

          {/* Export / Share Briefing */}
          {digest && (
            <div className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-full shadow-xs">
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-gray-700 hover:text-amber-700 px-2 py-1 transition-colors cursor-pointer"
                title="Copy formatted briefing to clipboard"
              >
                {copied ? '✓ Copied!' : '📋 Copy Brief'}
              </button>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={handleShare}
                className="text-[11px] font-bold text-gray-700 hover:text-amber-700 px-2 py-1 transition-colors cursor-pointer"
                title="Share briefing"
              >
                📤 Share
              </button>
            </div>
          )}

          {/* Audio Briefing Player */}
          {isSupported && digest && (
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3.5 py-1.5 rounded-full shadow-xs">
              {!isPlaying && !isPaused && (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-gray-700 hover:text-amber-700 transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Listen to audio briefing"
                >
                  <span className="text-amber-600 text-xs">▶</span>
                  <span>Listen to Brief</span>
                </button>
              )}

              {isPlaying && (
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <button
                    type="button"
                    onClick={pause}
                    className="text-[11px] font-bold text-gray-700 hover:text-amber-700 transition-colors cursor-pointer"
                    aria-label="Pause audio briefing"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    type="button"
                    onClick={stop}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label="Stop audio briefing"
                  >
                    ⏹ Stop
                  </button>
                </div>
              )}

              {isPaused && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resume}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                    aria-label="Resume audio briefing"
                  >
                    ▶ Resume
                  </button>
                  <button
                    type="button"
                    onClick={stop}
                    className="text-[11px] font-bold text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    aria-label="Stop audio briefing"
                  >
                    ⏹ Stop
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Refresh Briefing Button */}
          <button
            onClick={() => generate()}
            disabled={isLoading}
            className={`
              group flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all
              ${isLoading 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-900 hover:text-amber-600 cursor-pointer'}
            `}
          >
            {isLoading && (
              <div className="w-3 h-3 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isLoading ? 'Updating' : 'Refresh Briefing'}</span>
            {!isLoading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
