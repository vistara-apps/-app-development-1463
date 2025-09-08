import React, { useState } from 'react'
import { Send, Lightbulb, Target, Zap } from 'lucide-react'

export function FeedbackForm({ onSubmit, variant = 'compact' }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedSolution: '',
    impact: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in at least the title and description')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData({
        title: '',
        description: '',
        proposedSolution: '',
        impact: ''
      })
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="backdrop-blur-md bg-white/10 rounded-lg border border-white/20 p-8 shadow-card">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Submit Feedback</h2>
        <p className="text-blue-100">
          Help us improve by sharing your structured, actionable feedback
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-semibold mb-2">
            <Target className="inline mr-2" size={20} />
            Feedback Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Brief, clear title for your feedback"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            Problem Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Describe the issue, pain point, or area for improvement"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            <Lightbulb className="inline mr-2" size={20} />
            Proposed Solution
          </label>
          <textarea
            value={formData.proposedSolution}
            onChange={(e) => handleChange('proposedSolution', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Your suggested solution or approach"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">
            <Zap className="inline mr-2" size={20} />
            Expected Impact
          </label>
          <textarea
            value={formData.impact}
            onChange={(e) => handleChange('impact', e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="How would this improvement benefit the community?"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={20} />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
        </button>
      </form>
    </div>
  )
}