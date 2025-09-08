import { userService } from './userService.js'

const FRAME_BASE_URL = import.meta.env.VITE_FRAME_BASE_URL || 'http://localhost:5173'
const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY
const NEYNAR_BASE_URL = import.meta.env.VITE_NEYNAR_BASE_URL || 'https://api.neynar.com/v2'

export const frameService = {
  /**
   * Generate frame metadata for HTML head
   */
  generateFrameMetadata(page = 'hub', data = {}) {
    const baseMetadata = {
      'fc:frame': 'vNext',
      'fc:frame:image': `${FRAME_BASE_URL}/api/frame/image/${page}`,
      'fc:frame:post_url': `${FRAME_BASE_URL}/api/frame/action`,
      'og:image': `${FRAME_BASE_URL}/api/frame/image/${page}`,
      'og:title': 'Token Feedback Hub',
      'og:description': 'Your community\'s voice, amplified and actionable.'
    }

    switch (page) {
      case 'hub':
        return {
          ...baseMetadata,
          'fc:frame:button:1': '📝 Submit Feedback',
          'fc:frame:button:1:action': 'post',
          'fc:frame:button:1:target': `${FRAME_BASE_URL}/api/frame/submit`,
          'fc:frame:button:2': '🔄 Refresh',
          'fc:frame:button:2:action': 'post',
          'fc:frame:button:2:target': `${FRAME_BASE_URL}/api/frame/refresh`
        }

      case 'submit':
        return {
          ...baseMetadata,
          'fc:frame:image': `${FRAME_BASE_URL}/api/frame/image/submit`,
          'fc:frame:input:text': 'Enter feedback title...',
          'fc:frame:button:1': '✅ Submit',
          'fc:frame:button:1:action': 'post',
          'fc:frame:button:1:target': `${FRAME_BASE_URL}/api/frame/submit-feedback`,
          'fc:frame:button:2': '← Back to Hub',
          'fc:frame:button:2:action': 'post',
          'fc:frame:button:2:target': `${FRAME_BASE_URL}/api/frame/hub`
        }

      case 'feedback':
        return {
          ...baseMetadata,
          'fc:frame:image': `${FRAME_BASE_URL}/api/frame/image/feedback/${data.feedbackId}`,
          'fc:frame:button:1': `👍 Upvote (${data.upvotes || 0})`,
          'fc:frame:button:1:action': 'post',
          'fc:frame:button:1:target': `${FRAME_BASE_URL}/api/frame/upvote/${data.feedbackId}`,
          'fc:frame:button:2': '← Back to Hub',
          'fc:frame:button:2:action': 'post',
          'fc:frame:button:2:target': `${FRAME_BASE_URL}/api/frame/hub`
        }

      default:
        return baseMetadata
    }
  },

  /**
   * Validate frame signature using Neynar
   */
  async validateFrameMessage(frameMessage) {
    if (!NEYNAR_API_KEY) {
      console.warn('Neynar API key not configured, skipping frame validation')
      return { valid: false, message: 'API key not configured' }
    }

    try {
      const response = await fetch(`${NEYNAR_BASE_URL}/frame/validate`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          message_bytes_in_hex: frameMessage
        })
      })

      if (!response.ok) {
        throw new Error(`Frame validation failed: ${response.status}`)
      }

      const data = await response.json()
      return {
        valid: data.valid,
        action: data.action,
        interactor: data.action?.interactor,
        cast: data.action?.cast,
        input: data.action?.input?.text,
        button: data.action?.tapped_button
      }
    } catch (error) {
      console.error('Error validating frame message:', error)
      return { valid: false, error: error.message }
    }
  },

  /**
   * Handle frame action based on button pressed
   */
  async handleFrameAction(validatedMessage) {
    if (!validatedMessage.valid) {
      return { error: 'Invalid frame message' }
    }

    const { action, interactor, input, button } = validatedMessage
    const fid = interactor?.fid

    try {
      // Get or create user
      const user = await userService.getCurrentUser(fid)

      switch (button?.index) {
        case 1: // Primary action button
          if (action?.url?.includes('/submit')) {
            return { action: 'show_submit_form', user }
          } else if (action?.url?.includes('/upvote/')) {
            const feedbackId = action.url.split('/upvote/')[1]
            return { action: 'upvote', feedbackId, user }
          } else if (action?.url?.includes('/submit-feedback')) {
            return { action: 'submit_feedback', input, user }
          }
          break

        case 2: // Secondary action button
          if (action?.url?.includes('/hub') || action?.url?.includes('/refresh')) {
            return { action: 'show_hub', user }
          }
          break

        default:
          return { action: 'show_hub', user }
      }

      return { action: 'show_hub', user }
    } catch (error) {
      console.error('Error handling frame action:', error)
      return { error: error.message }
    }
  },

  /**
   * Generate frame image URL for different states
   */
  generateImageUrl(type, data = {}) {
    const params = new URLSearchParams(data)
    return `${FRAME_BASE_URL}/api/frame/image/${type}?${params.toString()}`
  },

  /**
   * Post feedback as a cast to Farcaster (optional)
   */
  async postFeedbackAsCast(feedback, userFid) {
    if (!NEYNAR_API_KEY) {
      console.warn('Neynar API key not configured, cannot post cast')
      return null
    }

    try {
      const castText = `💡 New feedback: "${feedback.title}"\n\n${feedback.description}\n\n🔗 View and upvote: ${FRAME_BASE_URL}/feedback/${feedback.feedbackId}`

      const response = await fetch(`${NEYNAR_BASE_URL}/cast`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          signer_uuid: process.env.NEYNAR_SIGNER_UUID, // Server-side only
          text: castText,
          embeds: [{
            url: `${FRAME_BASE_URL}/feedback/${feedback.feedbackId}`
          }]
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to post cast: ${response.status}`)
      }

      const data = await response.json()
      return data.cast?.hash
    } catch (error) {
      console.error('Error posting feedback as cast:', error)
      return null
    }
  },

  /**
   * Generate frame response HTML
   */
  generateFrameResponse(metadata, content = '') {
    const metaTags = Object.entries(metadata)
      .map(([key, value]) => `<meta property="${key}" content="${value}" />`)
      .join('\n    ')

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Token Feedback Hub</title>
    ${metaTags}
  </head>
  <body>
    ${content}
  </body>
</html>`
  }
}
