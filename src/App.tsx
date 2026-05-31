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
    <div className="min-h-screen bg-gray-50 selection:bg-violet-100">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Global Header */}
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Daily Digest
          </h1>
          <p className="text-gray-500 text-sm">
            AI-powered news briefing curated for you.
          </p>
        </header>

        <TopicSelector />
        <StatusBanner status={status} error={error} />

        <main>
          {/* Empty State / Initial View */}
          {isIdle && (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-2xl">
                📰
              </div>
              <div className="space-y-2">
                <p className="text-gray-400 font-medium">
                  Your briefing is ready to be prepared.
                </p>
                <p className="text-gray-400 text-xs">
                  Pick your topics above and hit Generate to get started.
                </p>
              </div>
              <button
                onClick={() => generate()}
                disabled={isGenerating}
                className="w-full md:w-auto px-12 py-4 bg-violet-600 text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all"
              >
                Generate Digest
              </button>
            </div>
          )}

          {/* Digest Content */}
          {hasContent && (
            <div className="space-y-6">
              <DigestHeader />
              <ExecutiveSummary 
                summary={digest.executiveSummary} 
                status={status} 
              />
              <div className="space-y-4">
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
          )}
        </main>

        <footer className="mt-20 pt-8 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
            Powered by NewsAPI & Gemini 2.0 Flash
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
