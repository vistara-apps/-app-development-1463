import { supabase, TABLES } from '../config/supabase.js'

const NEYNAR_API_KEY = import.meta.env.VITE_NEYNAR_API_KEY
const NEYNAR_BASE_URL = import.meta.env.VITE_NEYNAR_BASE_URL || 'https://api.neynar.com/v2'

export const userService = {
  async getCurrentUser(fid = null) {
    if (!supabase) {
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        userId: 'demo-user',
        farcasterId: 'demo-fid',
        displayName: 'Demo User',
        avatarUrl: null
      }
    }

    try {
      // If no FID provided, return demo user for now
      // In a real Farcaster frame, this would come from the frame context
      if (!fid) {
        return {
          userId: 'demo-user',
          farcasterId: 'demo-fid',
          displayName: 'Demo User',
          avatarUrl: null
        }
      }

      // Check if user exists in our database
      const { data: existingUser } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('farcaster_id', fid.toString())
        .single()

      if (existingUser) {
        return {
          userId: existingUser.user_id,
          farcasterId: existingUser.farcaster_id,
          displayName: existingUser.display_name,
          avatarUrl: existingUser.avatar_url
        }
      }

      // If user doesn't exist, fetch from Neynar and create
      if (NEYNAR_API_KEY) {
        const neynarUser = await this.fetchUserFromNeynar(fid)
        if (neynarUser) {
          const { data: newUser, error } = await supabase
            .from(TABLES.USERS)
            .insert({
              farcaster_id: fid.toString(),
              display_name: neynarUser.display_name,
              avatar_url: neynarUser.pfp_url
            })
            .select()
            .single()

          if (error) throw error

          return {
            userId: newUser.user_id,
            farcasterId: newUser.farcaster_id,
            displayName: newUser.display_name,
            avatarUrl: newUser.avatar_url
          }
        }
      }

      // Fallback: create user with minimal info
      const { data: newUser, error } = await supabase
        .from(TABLES.USERS)
        .insert({
          farcaster_id: fid.toString(),
          display_name: `User ${fid}`,
          avatar_url: null
        })
        .select()
        .single()

      if (error) throw error

      return {
        userId: newUser.user_id,
        farcasterId: newUser.farcaster_id,
        displayName: newUser.display_name,
        avatarUrl: newUser.avatar_url
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      // Return demo user as fallback
      return {
        userId: 'demo-user',
        farcasterId: 'demo-fid',
        displayName: 'Demo User',
        avatarUrl: null
      }
    }
  },

  async getUserProfile(userId) {
    if (!supabase) {
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 300))
      const users = {
        'user-1': { displayName: 'Alice Chen', avatarUrl: null },
        'user-2': { displayName: 'Bob Wilson', avatarUrl: null },
        'user-3': { displayName: 'Carol Davis', avatarUrl: null },
        'demo-user': { displayName: 'Demo User', avatarUrl: null }
      }
      return users[userId] || { displayName: 'Anonymous', avatarUrl: null }
    }

    try {
      const { data: user, error } = await supabase
        .from(TABLES.USERS)
        .select('display_name, avatar_url')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return {
        displayName: user.display_name,
        avatarUrl: user.avatar_url
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { displayName: 'Anonymous', avatarUrl: null }
    }
  },

  async fetchUserFromNeynar(fid) {
    if (!NEYNAR_API_KEY) {
      console.warn('Neynar API key not configured')
      return null
    }

    try {
      const response = await fetch(`${NEYNAR_BASE_URL}/user/bulk?fids=${fid}`, {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      })

      if (!response.ok) {
        throw new Error(`Neynar API error: ${response.status}`)
      }

      const data = await response.json()
      const user = data.users?.[0]

      if (!user) {
        return null
      }

      return {
        fid: user.fid,
        username: user.username,
        display_name: user.display_name || user.username,
        pfp_url: user.pfp_url,
        bio: user.profile?.bio?.text || ''
      }
    } catch (error) {
      console.error('Error fetching user from Neynar:', error)
      return null
    }
  },

  async updateUserProfile(userId, updates) {
    if (!supabase) {
      console.warn('Supabase not configured, cannot update user profile')
      return false
    }

    try {
      const { error } = await supabase
        .from(TABLES.USERS)
        .update({
          display_name: updates.displayName,
          avatar_url: updates.avatarUrl
        })
        .eq('user_id', userId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      return false
    }
  }
}
