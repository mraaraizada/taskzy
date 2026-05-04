# Project Dashboard - Admin Dashboard

This is an exact copy of the Taskzy admin dashboard, created as a standalone project called "project-dashboard". This version contains only the admin dashboard interface.

## Features

### Authentication System
- Beautiful animated carousel with space-themed visuals
- Email/password authentication
- Forgot password flow with OTP verification
- Social login buttons (Google, Facebook, Twitter, LinkedIn, Instagram)
- Admin-only access

### Admin Dashboard
- **Dashboard**: Overview with stats, charts, and recent activity
- **Tasks**: Complete task management system with stages
- **Team**: Team member management
- **Financial**: Budget tracking and payment management
- **Roles**: Role and permission management
- **Performance**: Team performance metrics
- **Reports**: Analytics and insights
- **Notes**: Personal notes system
- **Help**: Support ticket system
- **Settings**: Application settings
- **Archive**: Deleted items management

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskzy.io | admin123 |

## Project Structure

```
project-dashboard/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # UI components
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   ├── Header.jsx             # Page header
│   │   └── ... (other components)
│   ├── context/
│   │   └── AppContext.jsx         # Global state management
│   ├── hooks/
│   │   └── useAdminPassword.js
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login page
│   │   ├── TasksPage.jsx          # Tasks management
│   │   ├── TeamPage.jsx           # Team management
│   │   ├── FinancialPage.jsx      # Financial tracking
│   │   └── ... (other pages)
│   ├── lib/
│   │   └── utils.js
│   ├── App.jsx                    # Main app component
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Steps

1. **Navigate to the project directory**:
   ```bash
   cd project-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   - The app will run on `http://localhost:5173`

## Technologies Used

- **React 18** - UI library
- **Vite** - Build tool
- **Lucide React** - Icon library
- **Embla Carousel** - Carousel functionality
- **Recharts** - Charts and graphs
- **Sonner** - Toast notifications
- **Date-fns** - Date formatting

## Key Features

### Dashboard Components
- **Stat Cards**: Real-time statistics with trend indicators
- **Bar Charts**: Task distribution visualization
- **Donut Charts**: Budget allocation
- **Calendar**: Upcoming deadlines
- **Activity Feed**: Recent actions and updates
- **Customer Growth**: Growth metrics

### Task Management
- **7 Stage Workflow**: New → Start → Issue → Review A → Review B → Update → Complete
- **Drag & Drop**: (Ready for implementation)
- **Filters**: By stage, member, category, tags
- **Search**: Real-time task search
- **Bulk Actions**: Multi-select operations

### Team Management
- **Member Profiles**: Complete team member information
- **Role Assignment**: Flexible role system
- **Status Tracking**: Active/Inactive members
- **Performance Metrics**: Individual performance tracking

### Financial Management
- **Budget Tracking**: Task-level budget management
- **Payment Processing**: Payment status and history
- **Financial Reports**: Revenue and expense tracking
- **Export**: Data export functionality

## Dark Mode

The application includes full dark mode support:
- Toggle in Settings page
- Persistent across sessions
- Smooth transitions
- All components themed

## Customization

### Changing Brand Colors

Edit the color variables in components:
- Primary: `#3B5BFC`
- Purple: `#7C3AED`
- Success: `#12C479`
- Warning: `#F97316`

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation item in `Sidebar.jsx`
4. Update `pageConfig` in `App.jsx`

### Modifying User Roles

Edit `USERS` array in `src/context/AppContext.jsx`

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lazy loading for images
- Optimized re-renders
- Efficient state management
- Minimal bundle size

## License

This is a demonstration project based on the Taskzy application.

## Documentation

For detailed implementation guide, see [IMPLEMENTATION-GUIDE.md](./IMPLEMENTATION-GUIDE.md)

## Support

For questions or issues, refer to the implementation guide or create an issue in the project repository.
