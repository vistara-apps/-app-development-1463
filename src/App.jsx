import React, { useState, useEffect } from 'react'
import { FrameHeader } from './components/FrameHeader'
import { FeedbackForm } from './components/FeedbackForm'
import { FeedbackListItem } from './components/FeedbackListItem'
import { feedbackService } from './services/feedbackService'
import { userService } from './services/userService'

function App() {
  const [currentView, setCurrentView] = useState('hub')
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setLoading(true)
      
      // Simulate user authentication for demo
      const user = await userService.getCurrentUser()
      setCurrentUser(user)
      
      // Load feedback
      const feedback = await feedbackService.getFeedback()
      setFeedbackList(feedback)
    } catch (error) {
      console.error('Failed to initialize app:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const newFeedback = await feedbackService.submitFeedback({
        ...feedbackData,
        userId: currentUser?.userId || 'demo-user'
      })
      
      setFeedbackList(prev => [newFeedback, ...prev])
      setCurrentView('hub')
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    }
  }

  const handleUpvote = async (feedbackId) => {
    try {
      if (!currentUser) return
      
      await feedbackService.upvoteFeedback(feedbackId, currentUser.userId)
      
      setFeedbackList(prev => prev.map(item => 
        item.feedbackId === feedbackId 
          ? { ...item, upvotes: item.upvotes + 1, hasUpvoted: true }
          : item
      ))
    } catch (error) {
      console.error('Failed to upvote:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="relative z-10">
        <FrameHeader 
          currentView={currentView}
          onViewChange={setCurrentView}
          user={currentUser}
        />

        <main className="container mx-auto px-4 py-8">
          {currentView === 'submit' ? (
            <div className="max-w-2xl mx-auto">
              <FeedbackForm onSubmit={handleSubmitFeedback} />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  Token Feedback Hub
                </h1>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Your community's voice, amplified and actionable. Submit feedback, 
                  upvote ideas, and help shape the future together.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {feedbackList.map((feedback) => (
                  <FeedbackListItem
                    key={feedback.feedbackId}
                    feedback={feedback}
                    onUpvote={handleUpvote}
                    variant="withUpvote"
                  />
                ))}
              </div>

              {feedbackList.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-blue-100 text-lg mb-6">
                    No feedback yet. Be the first to share your ideas!
                  </p>
                  <button
                    onClick={() => setCurrentView('submit')}
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200"
                  >
                    Submit First Feedback
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App