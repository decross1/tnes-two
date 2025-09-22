import { VotingPanel } from '@/components/voting/VotingPanel'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-background">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-gradient mb-4">
            StoryWeaver
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create animated stories together through daily collaborative voting
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div>
            <VotingPanel />
          </div>

          <div className="card">
            <h2 className="text-2xl font-semibold mb-4 text-secondary">
              Current Story
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">
                No story in progress
              </p>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  Episodes: 0
                </p>
                <p className="text-sm text-gray-300">
                  Duration: 0:00
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">How it works</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
              <div>
                <div className="font-medium text-white mb-2">Daily Voting</div>
                <p>Submit and vote on words/phrases during 4 daily sessions</p>
              </div>
              <div>
                <div className="font-medium text-white mb-2">Story Creation</div>
                <p>Winning words generate animated scenes at 4pm daily</p>
              </div>
              <div>
                <div className="font-medium text-white mb-2">Watch Together</div>
                <p>View the growing collaborative story as it unfolds</p>
              </div>
              <div>
                <div className="font-medium text-white mb-2">Anonymous</div>
                <p>No sign-up required - just join and start creating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}