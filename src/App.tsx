import { useDigest } from './hooks/useDigest';
import { TopicSelector } from './components/TopicSelector/TopicSelector';
import { StatusBanner } from './components/StatusBanner/StatusBanner';
import { DigestHeader } from './components/DigestHeader/DigestHeader';
import { ExecutiveSummary } from './components/ExecutiveSummary/ExecutiveSummary';
import { ArticleCard } from './components/ArticleCard/ArticleCard';
import { ErrorBoundary } from './components/ErrorBoundary';

/**
 * Main application component.
 * Layout: Header -> TopicSelector -> Status -> DigestContent | EmptyState
 */
function App() {
  const { digest, status, error, generate } = useDigest();

  const isIdle = status === 'idle' && !digest;
  const isGenerating = status === 'fetching' || status === 'summarising';
  const hasContent = !!digest;

  return (
    <div className="min-h-screen bg-[#fafaf9] selection:bg-amber-100">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Global Header */}
        <header className="mb-12 text-center space-y-4">
          <div className="inline-block px-4 py-1 border-y border-gray-900">
            <h1 className="text-4xl md:text-6xl font-serif font-black text-gray-900 tracking-tight uppercase">
              The Daily Digest
            </h1>
          </div>
          <p className="font-serif italic text-gray-500 text-lg md:text-xl">
            A curated briefing of the world's news, filtered by AI for your interests.
          </p>
        </header>

        <TopicSelector />
        <StatusBanner status={status} error={error} />

        <main className="mt-8">
          {/* Empty State / Initial View */}
          {isIdle && (
            <div className="py-24 text-center space-y-8 animate-fade-in">
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-gray-500 font-serif italic text-xl">
                  Your personalized briefing is ready to be compiled.
                </p>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  Select your topics above to begin.
                </p>
              </div>
              <button
                onClick={() => generate()}
                disabled={isGenerating}
                className="group relative px-12 py-4 bg-gray-900 text-white font-bold rounded-sm overflow-hidden transition-all hover:bg-amber-600 active:scale-95"
              >
                <span className="relative z-10 uppercase tracking-[0.2em] text-sm">Compile My Digest</span>
              </button>
            </div>
          )}

          {/* Digest Content */}
          {hasContent && (
            <div className="space-y-12">
              <DigestHeader />
              <div className="max-w-3xl mx-auto">
                <ExecutiveSummary 
                  summary={digest.executiveSummary} 
                  status={status} 
                />
                <div className="mt-16 divide-y divide-gray-100">
                  {digest.items.map((item, index) => (
                    <ArticleCard 
                      key={item.article.id} 
                      item={item} 
                      index={index} 
                      isFromCache={digest.isFromCache}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="mt-32 pt-12 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.3em]">
            Powered by NewsAPI & Gemini 2.5 Flash Lite
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * Production entry point for the application.
 * Wraps the main App in an ErrorBoundary for robust failure handling.
 * 
 * @returns The application component tree.
 */
export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
