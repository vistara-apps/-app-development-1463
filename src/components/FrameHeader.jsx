import React from 'react'
import { ArrowLeft, Plus, Home, User } from 'lucide-react'

export function FrameHeader({ currentView, onViewChange, user }) {
  return (
    <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {currentView === 'submit' && (
              <button
                onClick={() => onViewChange('hub')}
                className="text-white hover:text-blue-200 transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TF</span>
              </div>
              <span className="text-white font-semibold text-lg">
                Token Feedback Hub
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-2">
            <button
              onClick={() => onViewChange('hub')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'hub'
                  ? 'bg-white/20 text-white'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home size={20} />
              <span className="hidden sm:inline">Hub</span>
            </button>
            
            <button
              onClick={() => onViewChange('submit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                currentView === 'submit'
                  ? 'bg-green-500 text-white'
                  : 'bg-green-500/80 text-white hover:bg-green-500'
              }`}
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Submit</span>
            </button>

            {user && (
              <div className="flex items-center space-x-2 text-blue-100 ml-4">
                <User size={20} />
                <span className="hidden md:inline">{user.displayName}</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}