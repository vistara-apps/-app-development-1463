import React from 'react'
import { ArrowUp, User, Clock, Target, Lightbulb, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function FeedbackListItem({ feedback, onUpvote, variant = 'withUpvote' }) {
  const handleUpvote = () => {
    if (!feedback.hasUpvoted) {
      onUpvote(feedback.feedbackId)
    }
  }

  return (
    <article className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-6 shadow-card hover:bg-white/15 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2 flex items-center">
            <Target className="mr-2 text-blue-300" size={20} />
            {feedback.title}
          </h3>
          
          <div className="flex items-center space-x-4 text-sm text-blue-200 mb-4">
            <div className="flex items-center space-x-1">
              <User size={16} />
              <span>{feedback.user?.displayName || 'Anonymous'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>

        {variant === 'withUpvote' && (
          <button
            onClick={handleUpvote}
            disabled={feedback.hasUpvoted}
            className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${
              feedback.hasUpvoted
                ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
                : 'bg-white/10 hover:bg-green-500/20 text-white hover:text-green-300'
            }`}
          >
            <ArrowUp size={20} />
            <span className="text-sm font-semibold mt-1">{feedback.upvotes}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-blue-100 leading-relaxed">
            {feedback.description}
          </p>
        </div>

        {feedback.proposedSolution && (
          <div className="border-l-4 border-blue-400 pl-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Lightbulb className="mr-2 text-yellow-300" size={16} />
              Proposed Solution
            </h4>
            <p className="text-blue-100">{feedback.proposedSolution}</p>
          </div>
        )}

        {feedback.impact && (
          <div className="border-l-4 border-green-400 pl-4">
            <h4 className="text-white font-semibold mb-2 flex items-center">
              <Zap className="mr-2 text-green-300" size={16} />
              Expected Impact
            </h4>
            <p className="text-blue-100">{feedback.impact}</p>
          </div>
        )}
      </div>
    </article>
  )
}