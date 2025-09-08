// Mock service for demo purposes
// In production, this would integrate with Supabase

let feedbackData = [
  {
    feedbackId: '1',
    userId: 'user-1',
    title: 'Improve Mobile Responsiveness',
    description: 'The current interface doesn\'t work well on mobile devices. Text is too small and buttons are hard to tap.',
    proposedSolution: 'Implement responsive design with larger touch targets and better typography scaling.',
    impact: 'Would make the platform accessible to mobile users, potentially increasing engagement by 40%.',
    upvotes: 15,
    hasUpvoted: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      displayName: 'Alice Chen',
      avatarUrl: null
    }
  },
  {
    feedbackId: '2',
    userId: 'user-2',
    title: 'Add Dark Mode Support',
    description: 'Many users prefer dark mode for better eye comfort, especially during extended usage sessions.',
    proposedSolution: 'Implement a toggle switch in the header that switches between light and dark themes.',
    impact: 'Better user experience and reduced eye strain for users who prefer dark interfaces.',
    upvotes: 8,
    hasUpvoted: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    user: {
      displayName: 'Bob Wilson',
      avatarUrl: null
    }
  },
  {
    feedbackId: '3',
    userId: 'user-3',
    title: 'Notification System',
    description: 'Users miss important updates because there\'s no notification system in place.',
    proposedSolution: 'Add in-app notifications and optional email alerts for feedback responses.',
    impact: 'Increased user engagement and faster response times to community discussions.',
    upvotes: 23,
    hasUpvoted: true,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    user: {
      displayName: 'Carol Davis',
      avatarUrl: null
    }
  }
]

export const feedbackService = {
  async getFeedback() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return feedbackData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async submitFeedback(feedbackInput) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newFeedback = {
      feedbackId: Date.now().toString(),
      userId: feedbackInput.userId,
      title: feedbackInput.title,
      description: feedbackInput.description,
      proposedSolution: feedbackInput.proposedSolution || '',
      impact: feedbackInput.impact || '',
      upvotes: 0,
      hasUpvoted: false,
      createdAt: new Date().toISOString(),
      user: {
        displayName: 'Demo User',
        avatarUrl: null
      }
    }
    
    feedbackData.unshift(newFeedback)
    return newFeedback
  },

  async upvoteFeedback(feedbackId, userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const feedback = feedbackData.find(f => f.feedbackId === feedbackId)
    if (feedback && !feedback.hasUpvoted) {
      feedback.upvotes += 1
      feedback.hasUpvoted = true
    }
    
    return feedback
  }
}