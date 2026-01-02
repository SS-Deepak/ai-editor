'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  MoreVertical,
  Sun,
  Moon,
  Sparkles,
  User,
  Shield,
  LogIn,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore, useIsAdmin } from '@/store/auth-store';
import { Button, IconButton } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  updatedAt: string;
  pages: number;
}

const mockProjects: Project[] = [
  {
    id: 'project_demo',
    name: 'My Demo Website',
    updatedAt: '2 hours ago',
    pages: 3,
  },
];

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, loginAsAdmin, loginAsUser, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const [projects] = useState<Project[]>(mockProjects);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginAsAdmin={loginAsAdmin} onLoginAsUser={loginAsUser} />;
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-[#0f0f0f]">
      {/* Header */}
      <header className="h-16 border-b border-outline-light dark:border-outline-dark bg-white dark:bg-surface-dark">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-material-lg bg-gradient-to-r from-[#492cdd] to-[#ad38e2] flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-xl font-semibold text-on-surface-light dark:text-on-surface-dark">
              AI Editor
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* User Badge */}
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full',
              isAdmin 
                ? 'bg-amber-100 dark:bg-amber-900/30' 
                : 'bg-primary-50 dark:bg-primary-900/30'
            )}>
              {isAdmin ? (
                <Shield size={16} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <User size={16} className="text-primary dark:text-primary-300" />
              )}
              <span className={cn(
                'text-label-md font-medium',
                isAdmin 
                  ? 'text-amber-700 dark:text-amber-400' 
                  : 'text-primary dark:text-primary-300'
              )}>
                {user?.name}
              </span>
            </div>

            <IconButton
              onClick={logout}
              tooltip="Switch account"
            >
              <LogOut size={20} />
            </IconButton>

            <div className="w-px h-6 bg-outline-light dark:bg-outline-dark" />

            <IconButton
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </IconButton>
            <Button>
              <Plus size={18} />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-headline-lg text-on-surface-light dark:text-on-surface-dark mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-body-lg text-gray-500">
            {isAdmin 
              ? 'You have admin access. Manage elements, palettes, and layouts.'
              : 'Continue working on your projects or create a new one.'}
          </p>
        </div>

        {/* Admin Quick Actions */}
        {isAdmin && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminQuickAction 
              icon={<Plus size={20} />}
              title="Create Element"
              description="Add new elements to the library"
            />
            <AdminQuickAction 
              icon={<Sparkles size={20} />}
              title="Manage Palettes"
              description="Edit color palettes"
            />
            <AdminQuickAction 
              icon={<FolderOpen size={20} />}
              title="Layout Templates"
              description="Create page layouts"
            />
          </div>
        )}

        {/* Projects Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-title-lg text-on-surface-light dark:text-on-surface-dark">
            {isAdmin ? 'All Projects' : 'Your Projects'}
          </h2>
          <div className="flex items-center gap-2 text-body-sm text-gray-500">
            <Clock size={16} />
            <span>Recently edited</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* New Project Card */}
          <button className="card p-6 flex flex-col items-center justify-center gap-4 min-h-[200px] border-2 border-dashed border-outline-light dark:border-outline-dark hover:border-primary hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors group">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
              <Plus size={24} className="text-gray-400 group-hover:text-primary" />
            </div>
            <span className="text-title-md text-gray-500 group-hover:text-primary">
              Create new project
            </span>
          </button>

          {/* Project Cards */}
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/editor/${project.id}`}
              className="card overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 flex items-center justify-center">
                <FolderOpen size={40} className="text-primary/50" />
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-title-md text-on-surface-light dark:text-on-surface-dark group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <IconButton size="sm" variant="ghost">
                    <MoreVertical size={16} />
                  </IconButton>
                </div>
                <div className="flex items-center gap-4 text-body-sm text-gray-500">
                  <span>{project.pages} pages</span>
                  <span>•</span>
                  <span>{project.updatedAt}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-title-lg text-on-surface-light dark:text-on-surface-dark mb-2">
              No projects yet
            </h3>
            <p className="text-body-lg text-gray-500 mb-6">
              Create your first project to get started
            </p>
            <Button>
              <Plus size={18} />
              Create Project
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// Login Screen Component
interface LoginScreenProps {
  onLoginAsAdmin: () => void;
  onLoginAsUser: () => void;
}

function LoginScreen({ onLoginAsAdmin, onLoginAsUser }: LoginScreenProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-[#0f0f0f] dark:to-purple-900/20 flex items-center justify-center p-6">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4">
        <IconButton
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </IconButton>
      </div>

      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#492cdd] to-[#ad38e2] flex items-center justify-center shadow-material-3">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-headline-md font-bold text-on-surface-light dark:text-on-surface-dark mb-2">
            AI Website Editor
          </h1>
          <p className="text-body-lg text-gray-500">
            Build beautiful websites with drag & drop
          </p>
        </div>

        {/* Login Options */}
        <div className="card p-6 space-y-4">
          <p className="text-center text-body-md text-gray-500 mb-2">
            Choose how you'd like to continue
          </p>

          {/* Admin Login */}
          <button
            onClick={onLoginAsAdmin}
            className={cn(
              'w-full p-4 rounded-material-lg text-left',
              'border-2 border-amber-200 dark:border-amber-800',
              'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
              'hover:border-amber-400 dark:hover:border-amber-600',
              'hover:shadow-material-2',
              'transition-all duration-200 group'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-material-1">
                <Shield size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-title-md font-semibold text-amber-700 dark:text-amber-400">
                  Admin User
                </h3>
                <p className="text-body-sm text-amber-600/80 dark:text-amber-500/80">
                  Create & manage elements, palettes, layouts
                </p>
              </div>
              <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Regular User Login */}
          <button
            onClick={onLoginAsUser}
            className={cn(
              'w-full p-4 rounded-material-lg text-left',
              'border-2 border-primary-100 dark:border-primary-800',
              'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20',
              'hover:border-primary dark:hover:border-primary-600',
              'hover:shadow-material-2',
              'transition-all duration-200 group'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-material-1">
                <User size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-title-md font-semibold text-primary dark:text-primary-300">
                  Demo User
                </h3>
                <p className="text-body-sm text-primary/80 dark:text-primary-400/80">
                  Build websites using the element library
                </p>
              </div>
              <ChevronRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <p className="text-center text-body-sm text-gray-400 mt-6">
          Demo mode — no password required
        </p>
      </div>
    </div>
  );
}

// Admin Quick Action Card
interface AdminQuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function AdminQuickAction({ icon, title, description }: AdminQuickActionProps) {
  return (
    <button className="card p-4 text-left hover:shadow-material-2 transition-shadow group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-material bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <h3 className="text-title-sm font-medium text-on-surface-light dark:text-on-surface-dark">
            {title}
          </h3>
          <p className="text-body-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}
