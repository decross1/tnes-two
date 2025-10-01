import { VotingPanel } from '@/components/voting/VotingPanel'
import { StoryViewer } from '@/components/story/StoryViewer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-5xl">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary">
            StoryWeaver
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-2"></div>
        </header>

        {/* Main Content - Mobile: Stack, Desktop: 2-column with constrained height */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 lg:h-[calc(100vh-140px)]">
          {/* Story Viewer - Show first on mobile for immediate engagement */}
          <div className="order-1 lg:order-2 lg:flex lg:flex-col">
            <StoryViewer />
          </div>

          {/* Voting Panel */}
          <div className="order-2 lg:order-1 lg:flex lg:flex-col">
            <VotingPanel />
          </div>
        </div>
      </div>
    </main>
  )
}