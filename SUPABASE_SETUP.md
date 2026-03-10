# Supabase Integration Setup Guide

This guide will help you set up Supabase for real data persistence in the Wedding Command Center.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in with your account
3. Click "New Project"
4. Fill in the project details:
   - **Name**: wedding-planner (or your choice)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your location
5. Click "Create new project" and wait for it to initialize

## Step 2: Get Your API Keys

1. Once your project is created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://...supabase.co`)
   - **anon public** key (under "Project API keys")
3. Keep these safe!

## Step 3: Create Database Tables

1. In Supabase, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the SQL schema below
4. Click "Run"

### Database Schema

```sql
-- Create weddings table
CREATE TABLE weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_names TEXT NOT NULL,
  wedding_date DATE NOT NULL,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

-- Create timeline_events table
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('planning', 'design', 'logistics', 'celebration')),
  completed BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  vendor_type TEXT NOT NULL CHECK (vendor_type IN ('caterer', 'photographer', 'florist', 'venue', 'music', 'other')),
  file_name TEXT NOT NULL,
  uploaded_date TIMESTAMP DEFAULT NOW(),
  amount DECIMAL(10, 2),
  notes TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

-- Create mood_board_images table
CREATE TABLE mood_board_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('flowers', 'dress', 'decor', 'colors', 'cake', 'other')),
  uploaded_by TEXT NOT NULL,
  uploaded_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_date TIMESTAMP DEFAULT NOW(),
  updated_date TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_timeline_events_wedding_id ON timeline_events(wedding_id);
CREATE INDEX idx_contracts_wedding_id ON contracts(wedding_id);
CREATE INDEX idx_mood_board_images_wedding_id ON mood_board_images(wedding_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_board_images ENABLE ROW LEVEL SECURITY;
```

## Step 4: Configure Environment Variables

1. In your project root, create a `.env.local` file (or copy from `.env.example`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Replace the values with your actual Supabase URL and anon key

## Step 5: Start the Application

```bash
npm run dev
```

The app will now:
- Automatically create a demo wedding entry if none exists
- Load real data from Supabase (or fall back to demo data if not configured)
- Store all changes in Supabase

## Testing the Integration

Once the app is running:

1. **View Data**: All data on the dashboard, timeline, contracts, and mood board will come from Supabase
2. **Mark Events Complete**: Click on the timeline event icons to mark them as completed (updates Supabase)
3. **Delete Contracts**: Planner role can delete contracts (removes from Supabase)
4. **Delete Images**: Planner role can delete mood board images (removes from Supabase)

## Troubleshooting

### Data is not loading
- Check that `.env.local` has the correct Supabase URL and key
- Verify the database tables were created successfully in Supabase
- Check browser console for error messages

### "Failed to load data. Using demo mode" message
- This means Supabase is not configured or there's a connection issue
- The app will use mock data as a fallback
- Check your `.env.local` file and credentials

### Can't connect to Supabase
- Verify your Project URL is correct (should include `https://` and `.supabase.co`)
- Ensure your anon key is correct (not the service role key)
- Check that your Supabase project is active and not paused

## Next Steps

After setting up Supabase:

1. **Add Authentication**: Implement user login/signup for planners and couples
2. **File Storage**: Use Supabase Storage for actual contract PDFs and images
3. **Real-time Updates**: Enable WebSocket subscriptions for live collaboration
4. **Row Level Security**: Set up security policies for multi-user access
5. **Email Notifications**: Send notifications when data changes

## Database Queries

The app uses these operations:

- **Get timeline events**: `SELECT * FROM timeline_events WHERE wedding_id = ?`
- **Update event**: `UPDATE timeline_events SET completed = ? WHERE id = ?`
- **Get contracts**: `SELECT * FROM contracts WHERE wedding_id = ?`
- **Delete contract**: `DELETE FROM contracts WHERE id = ?`
- **Get mood board images**: `SELECT * FROM mood_board_images WHERE wedding_id = ?`
- **Delete image**: `DELETE FROM mood_board_images WHERE id = ?`

## Security Notes

⚠️ **Important for Production:**
- Never commit `.env.local` to version control
- Use Supabase Row Level Security (RLS) to restrict data access
- Implement proper authentication before deploying
- Don't use the anon key in production without RLS policies
- Consider using a service role key for backend operations

## Support

For Supabase issues, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://supabase.com/community)
