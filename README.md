# 💍 Wedding Command Center - Client Portal

An elegant, collaborative wedding planning platform designed to reduce stress and increase transparency between wedding planners and couples.

## Overview

The Wedding Command Center is a "Serene Sophistication" platform that serves as a shared workspace where planners and couples collaborate seamlessly. The MVP focuses on three core features:

- **📄 Contract Vault** - Secure storage and organization of vendor contracts
- **📅 Live Timeline** - Visual milestone tracking for the wedding planning journey  
- **✨ Collaborative Mood Board** - Shared inspiration gallery for design ideas

## Project Structure

```
src/
├── pages/
│   ├── Dashboard.tsx          # Main overview dashboard
│   ├── Timeline.tsx           # Wedding timeline with milestones
│   ├── ContractVault.tsx      # Vendor contract management
│   └── MoodBoard.tsx          # Shared inspiration gallery
├── components/
│   ├── Navigation/
│   │   └── Navigation.tsx    # Main navigation component
│   ├── Timeline/
│   ├── ContractVault/
│   └── MoodBoard/
├── types/
│   └── index.ts             # TypeScript type definitions
├── contexts/                # State management (future implementation)
├── App.tsx                  # Main app component
└── index.css               # Tailwind CSS styles
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v3
- **Build Tool**: Vite
- **Package Manager**: npm
- **Backend**: Supabase (PostgreSQL + REST API)
- **ORM**: Direct Supabase client

## Design Philosophy

**"Serene Sophistication"** - The interface evokes serenity, luxury, and calm confidence through:

- Generous whitespace and visual breathing room
- Soft, neutral color palette (creams, taupes, golds)
- Large, readable serif typography for headers
- Elegant subtle shadows instead of harsh borders
- Smooth transitions and animations

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Supabase account (free tier available at supabase.com)

### Installation

```bash
# Install dependencies
npm install

# Configure Supabase (see SUPABASE_SETUP.md for detailed instructions)
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

### Supabase Configuration

For complete setup instructions including:
- Creating a Supabase project
- Setting up the database schema
- Configuring environment variables
- Testing the integration

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

## Features

### 📄 Contract Vault
- Upload and organize vendor contracts
- Filter by vendor type (caterer, photographer, venue, etc.)
- View contract summary and key details
- Secure document storage and download
- Planner-only upload and edit capabilities

### 📅 Live Timeline
- Visual timeline of wedding milestones
- Filter by category (planning, design, logistics, celebration)
- Mark milestones as completed
- Track overall progress percentage
- Upcoming deadlines at a glance

### ✨ Mood Board
- Collaborative inspiration gallery
- Organized by category (flowers, dress, décor, colors, cake, etc.)
- Contribute and share ideas with partner/planner
- Add notes and references to images
- Real-time collaboration-ready architecture

### 🏠 Dashboard
- Overview of upcoming milestones
- Recent vendor contracts status
- Mood board highlights
- Planning progress tracking
- Role-specific CTAs (couple vs planner)

## Current State

This is the **MVP with Real Supabase Integration**. Currently implemented:

✅ Full UI screens with elegant design  
✅ Mock data (fallback) for testing without Supabase  
✅ Supabase integration for real data persistence  
✅ Data fetching from Supabase database  
✅ Create/update/delete operations  
✅ Navigation and page routing  
✅ Role-based view variations (planner/couple)  
✅ Responsive design  
❌ Authentication (coming next)  
❌ File upload storage (coming next)  
❌ Real-time collaboration (coming next)  

## Usage

### Switch User Roles

To view the interface from different perspectives, edit `App.tsx`:

```tsx
const [userRole] = useState<UserRole>('planner'); // Change to 'planner'
```

- **Couple**: Can view all content, limited editing on mood board
- **Planner**: Full admin access to edit timelines, upload contracts

## Next Steps

1. **Authentication** - Secure login for planners and couples
2. **File Storage** - Upload contracts and mood board images to Supabase Storage
3. **Real-time Collaboration** - WebSocket subscriptions for live updates
4. **Row Level Security** - Implement access control policies
5. **Email Notifications** - Automated alerts for important events
6. **Advanced Features** - Budgeting, seating charts, vendor portals

## Color Palette

- **Cream**: `#FAF8F6` (Background)
- **Sand**: `#F5EFE8` (Light Accents)
- **Blush**: `#E8D5CC` (Soft Highlights)
- **Taupe**: `#D4CBBF` (Medium Accents)
- **Gold**: `#C9B8A3` (Elegant Accent)
- **Slate**: `#8B8680` (Text Secondary)
- **Charcoal**: `#4A4A48` (Text Primary)

## Typography

- **Headers**: Georgia serif font for elegance
- **Body**: System sans-serif for readability
- **Emphasis**: Medium weight for CTAs and important info

## Mobile Responsive

The interface is fully responsive and optimized for:
- Mobile (320px+)
- Tablet (768px+)  
- Desktop (1024px+)

## License

Private - Wedding Planning Platform MVP
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
