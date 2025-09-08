-- Token Feedback Hub Database Schema
-- This file contains the SQL schema for setting up the Supabase database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farcaster_id VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE feedback (
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    cast_hash VARCHAR(255), -- Optional: link to Farcaster cast
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    proposed_solution TEXT,
    impact TEXT,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
    vote_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    feedback_id UUID NOT NULL REFERENCES feedback(feedback_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(feedback_id, user_id) -- Prevent duplicate votes
);

-- Indexes for better performance
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX idx_feedback_upvotes ON feedback(upvotes DESC);
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_votes_feedback_id ON votes(feedback_id);
CREATE INDEX idx_votes_user_id ON votes(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Users can read all user profiles
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Anyone can read feedback
CREATE POLICY "Anyone can view feedback" ON feedback
    FOR SELECT USING (true);

-- Authenticated users can create feedback
CREATE POLICY "Authenticated users can create feedback" ON feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own feedback
CREATE POLICY "Users can update own feedback" ON feedback
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Users can delete their own feedback
CREATE POLICY "Users can delete own feedback" ON feedback
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Anyone can read votes (for displaying upvote counts)
CREATE POLICY "Anyone can view votes" ON votes
    FOR SELECT USING (true);

-- Authenticated users can create votes
CREATE POLICY "Authenticated users can create votes" ON votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes" ON votes
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Function to update upvote count when votes are added/removed
CREATE OR REPLACE FUNCTION update_feedback_upvotes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE feedback 
        SET upvotes = upvotes + 1 
        WHERE feedback_id = NEW.feedback_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE feedback 
        SET upvotes = upvotes - 1 
        WHERE feedback_id = OLD.feedback_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update upvote counts
CREATE TRIGGER trigger_update_feedback_upvotes
    AFTER INSERT OR DELETE ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_upvotes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at timestamps
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at 
    BEFORE UPDATE ON feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
