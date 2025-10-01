import { VotingPanel } from '@/components/voting/VotingPanel'
import { StoryViewer } from '@/components/story/StoryViewer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-2">
            StoryWeaver
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mb-3"></div>
          <p className="text-base md:text-lg text-text-secondary max-w-2xl">
            Create animated stories together through collaborative voting
          </p>
        </header>

        {/* Main Content - Mobile: Stack, Desktop: 2-column */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Story Viewer - Show first on mobile for immediate engagement */}
          <div className="order-1 lg:order-2">
            <StoryViewer />
          </div>

          {/* Voting Panel */}
          <div className="order-2 lg:order-1">
            <VotingPanel />
          </div>
        </div>

        {/* How It Works - Simplified */}
        <div className="card max-w-2xl mx-auto">
          <h3 className="text-xl font-medium text-text-primary mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">1</span>
              <p><span className="font-medium text-text-primary">Submit</span> a phrase (up to 10 words)</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">2</span>
              <p><span className="font-medium text-text-primary">Vote</span> for your favorite submissions</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">3</span>
              <p><span className="font-medium text-text-primary">Watch</span> the winning phrase become an animated episode</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              No sign-up required • Fully anonymous • New episodes daily
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}