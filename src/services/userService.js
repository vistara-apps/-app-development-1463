// Mock user service for demo purposes
// In production, this would integrate with Farcaster via Neynar API

export const userService = {
  async getCurrentUser() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock user data
    return {
      userId: 'demo-user',
      farcasterId: 'demo-fid',
      displayName: 'Demo User',
      avatarUrl: null
    }
  },

  async getUserProfile(userId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Mock user lookup
    const users = {
      'user-1': { displayName: 'Alice Chen', avatarUrl: null },
      'user-2': { displayName: 'Bob Wilson', avatarUrl: null },
      'user-3': { displayName: 'Carol Davis', avatarUrl: null },
      'demo-user': { displayName: 'Demo User', avatarUrl: null }
    }
    
    return users[userId] || { displayName: 'Anonymous', avatarUrl: null }
  }
}