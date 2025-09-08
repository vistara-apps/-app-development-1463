import { supabase, TABLES } from '../config/supabase.js'

// Mock data for fallback when Supabase is not configured
let mockFeedbackData = [
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
  async getFeedback(userId = null) {
    if (!supabase) {
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 1000))
      return mockFeedbackData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    }

    try {
      // Get feedback with user information and vote status
      const { data: feedback, error } = await supabase
        .from(TABLES.FEEDBACK)
        .select(`
          feedback_id,
          title,
          description,
          proposed_solution,
          impact,
          upvotes,
          created_at,
          updated_at,
          cast_hash,
          users!inner (
            user_id,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Check if user has voted on each feedback item
      let feedbackWithVotes = feedback
      if (userId && feedback.length > 0) {
        const feedbackIds = feedback.map(f => f.feedback_id)
        const { data: votes } = await supabase
          .from(TABLES.VOTES)
          .select('feedback_id')
          .eq('user_id', userId)
          .in('feedback_id', feedbackIds)

        const votedFeedbackIds = new Set(votes?.map(v => v.feedback_id) || [])
        
        feedbackWithVotes = feedback.map(f => ({
          feedbackId: f.feedback_id,
          userId: f.users.user_id,
          title: f.title,
          description: f.description,
          proposedSolution: f.proposed_solution,
          impact: f.impact,
          upvotes: f.upvotes,
          hasUpvoted: votedFeedbackIds.has(f.feedback_id),
          createdAt: f.created_at,
          castHash: f.cast_hash,
          user: {
            displayName: f.users.display_name,
            avatarUrl: f.users.avatar_url
          }
        }))
      } else {
        feedbackWithVotes = feedback.map(f => ({
          feedbackId: f.feedback_id,
          userId: f.users.user_id,
          title: f.title,
          description: f.description,
          proposedSolution: f.proposed_solution,
          impact: f.impact,
          upvotes: f.upvotes,
          hasUpvoted: false,
          createdAt: f.created_at,
          castHash: f.cast_hash,
          user: {
            displayName: f.users.display_name,
            avatarUrl: f.users.avatar_url
          }
        }))
      }

      return feedbackWithVotes
    } catch (error) {
      console.error('Error fetching feedback:', error)
      throw new Error('Failed to fetch feedback')
    }
  },

  async submitFeedback(feedbackInput) {
    if (!supabase) {
      // Fallback to mock data
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
      mockFeedbackData.unshift(newFeedback)
      return newFeedback
    }

    try {
      const { data, error } = await supabase
        .from(TABLES.FEEDBACK)
        .insert({
          user_id: feedbackInput.userId,
          title: feedbackInput.title,
          description: feedbackInput.description,
          proposed_solution: feedbackInput.proposedSolution || null,
          impact: feedbackInput.impact || null,
          cast_hash: feedbackInput.castHash || null
        })
        .select(`
          feedback_id,
          title,
          description,
          proposed_solution,
          impact,
          upvotes,
          created_at,
          cast_hash,
          users!inner (
            user_id,
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      return {
        feedbackId: data.feedback_id,
        userId: data.users.user_id,
        title: data.title,
        description: data.description,
        proposedSolution: data.proposed_solution,
        impact: data.impact,
        upvotes: data.upvotes,
        hasUpvoted: false,
        createdAt: data.created_at,
        castHash: data.cast_hash,
        user: {
          displayName: data.users.display_name,
          avatarUrl: data.users.avatar_url
        }
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw new Error('Failed to submit feedback')
    }
  },

  async upvoteFeedback(feedbackId, userId) {
    if (!supabase) {
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 300))
      const feedback = mockFeedbackData.find(f => f.feedbackId === feedbackId)
      if (feedback && !feedback.hasUpvoted) {
        feedback.upvotes += 1
        feedback.hasUpvoted = true
      }
      return feedback
    }

    try {
      // Check if user has already voted
      const { data: existingVote } = await supabase
        .from(TABLES.VOTES)
        .select('vote_id')
        .eq('feedback_id', feedbackId)
        .eq('user_id', userId)
        .single()

      if (existingVote) {
        throw new Error('User has already voted on this feedback')
      }

      // Insert vote (upvote count will be updated automatically by trigger)
      const { error: voteError } = await supabase
        .from(TABLES.VOTES)
        .insert({
          feedback_id: feedbackId,
          user_id: userId
        })

      if (voteError) throw voteError

      // Return updated feedback
      const { data: updatedFeedback, error: fetchError } = await supabase
        .from(TABLES.FEEDBACK)
        .select(`
          feedback_id,
          title,
          description,
          proposed_solution,
          impact,
          upvotes,
          created_at,
          cast_hash,
          users!inner (
            user_id,
            display_name,
            avatar_url
          )
        `)
        .eq('feedback_id', feedbackId)
        .single()

      if (fetchError) throw fetchError

      return {
        feedbackId: updatedFeedback.feedback_id,
        userId: updatedFeedback.users.user_id,
        title: updatedFeedback.title,
        description: updatedFeedback.description,
        proposedSolution: updatedFeedback.proposed_solution,
        impact: updatedFeedback.impact,
        upvotes: updatedFeedback.upvotes,
        hasUpvoted: true,
        createdAt: updatedFeedback.created_at,
        castHash: updatedFeedback.cast_hash,
        user: {
          displayName: updatedFeedback.users.display_name,
          avatarUrl: updatedFeedback.users.avatar_url
        }
      }
    } catch (error) {
      console.error('Error upvoting feedback:', error)
      throw new Error('Failed to upvote feedback')
    }
  },

  async removeFeedback(feedbackId, userId) {
    if (!supabase) {
      // Fallback to mock data
      const index = mockFeedbackData.findIndex(f => f.feedbackId === feedbackId && f.userId === userId)
      if (index > -1) {
        mockFeedbackData.splice(index, 1)
        return true
      }
      return false
    }

    try {
      const { error } = await supabase
        .from(TABLES.FEEDBACK)
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing feedback:', error)
      throw new Error('Failed to remove feedback')
    }
  }
}
