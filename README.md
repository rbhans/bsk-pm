# projectsidekick [psk]

A modern, feature-rich project management application built for solo entrepreneurs and freelancers. Manage your projects, track time, organize tasks, and stay productive with an integrated Pomodoro timer.

## Features

### 🎯 Kanban Board
- Visual project tracking with drag-and-drop functionality
- Four customizable columns: Backlog, In Progress, Review, and Completed
- Quick project status updates

### 📁 Project Management
- Create and manage unlimited projects
- Store client contact information (name, email, phone)
- Add detailed project descriptions
- Upload and manage file attachments
- Full project editing capabilities

### ⏱️ Time Tracking
- Log time spent on each project
- Track work sessions with descriptions and dates
- View total hours per project
- Historical time entry management

### ✅ Daily Task List
- Create and manage daily tasks
- Mark tasks as complete with visual checkboxes
- Track daily progress
- Simple and intuitive interface

### 🍅 Pomodoro Timer
- Integrated Pomodoro timer with visual countdown
- Customizable work/break durations
- Session counter
- Browser notifications when sessions complete
- Configurable long break intervals

### 🎨 Design
- Clean, modern interface built with React and Tailwind CSS
- Responsive design works on all devices
- [basidekick] branding with signature matrix green accents
- Professional shadcn/ui components

## Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality UI components
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **date-fns** - Date utilities
- **LocalStorage** - Client-side data persistence

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development

The app will be available at `http://localhost:5173` when running the dev server.

All data is stored in your browser's localStorage, so it persists across sessions but is specific to your browser.

## Usage

### Creating a Project
1. Click "New Project" on the dashboard
2. Fill in project details (name, description, client info)
3. Project appears in the Backlog column

### Managing Projects
- Drag projects between Kanban columns to update status
- Click any project card to view full details
- Edit project information, log time, and upload files

### Time Tracking
1. Navigate to a project detail page
2. Enter work description, duration (in minutes), and date
3. Click "Log Time" to add the entry
4. View total hours at the top of the time tracking section

### Daily Tasks
- Add tasks directly from the dashboard
- Check off tasks as you complete them
- Tasks reset based on completion date

### Pomodoro Timer
1. Click the settings icon to customize durations
2. Click play to start a work session
3. Timer automatically switches between work and break periods
4. Enable browser notifications for session alerts

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── Dashboard.tsx # Main dashboard view
│   ├── KanbanBoard.tsx
│   ├── ProjectsList.tsx
│   ├── ProjectDetails.tsx
│   ├── DailyTaskList.tsx
│   ├── PomodoroTimer.tsx
│   └── Layout.tsx
├── lib/
│   ├── storage.ts    # LocalStorage utilities
│   └── utils.ts      # Helper functions
├── types/
│   └── index.ts      # TypeScript type definitions
├── App.tsx
├── main.tsx
└── index.css
```

## Data Storage

All data is stored locally in your browser using localStorage. This means:
- ✅ Fast, instant access
- ✅ No server or database required
- ✅ Privacy - your data never leaves your device
- ⚠️ Data is browser-specific
- ⚠️ Clearing browser data will remove all projects and tasks

## Future Enhancements

Potential features for future versions:
- Export/Import data functionality
- Multiple user accounts
- Cloud sync
- Project templates
- Team collaboration
- Advanced reporting and analytics
- Calendar integration

## License

Private project for personal use.

---

**[basidekick]** - Built with ❤️ for productivity