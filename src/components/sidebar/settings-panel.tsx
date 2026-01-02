'use client';

import { useState } from 'react';
import {
  User,
  Shield,
  Moon,
  Sun,
  Monitor,
  Grid3x3,
  Magnet,
  Save,
  LogIn,
  LogOut,
  ChevronRight,
  Palette,
  Type,
  Layout,
  Settings2,
  Globe,
} from 'lucide-react';
import { useAuthStore, useIsAdmin } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import { Button } from '../ui';
import { SiteSettingsPanel } from './site-settings-panel';

type SettingsTab = 'account' | 'site';

export function SettingsPanel() {
  const { user, isAuthenticated, loginAsAdmin, loginAsUser, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<SettingsTab>('site');

  // If not authenticated, show login options
  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Tab Switcher */}
      <div className="flex border-b border-outline-light dark:border-outline-dark">
        <button
          onClick={() => setActiveTab('site')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            activeTab === 'site'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Globe size={16} />
          Site Defaults
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            activeTab === 'account'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <Settings2 size={16} />
          Account
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'site' ? (
          <SiteSettingsPanel />
        ) : (
          <AccountSettingsContent
            user={user}
            isAdmin={isAdmin}
            theme={theme}
            setTheme={setTheme}
            logout={logout}
          />
        )}
      </div>
    </div>
  );
}

// Account settings content (moved from main component)
interface AccountSettingsProps {
  user: any;
  isAdmin: boolean;
  theme: string;
  setTheme: (theme: any) => void;
  logout: () => void;
}

function AccountSettingsContent({ user, isAdmin, theme, setTheme, logout }: AccountSettingsProps) {
  return (
    <div className="p-3">
      {/* User Profile Card */}
      <div className="mb-4 p-4 rounded-material-lg bg-surface-light dark:bg-surface-variant-dark border border-outline-light dark:border-outline-dark">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isAdmin
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                : 'bg-gradient-to-br from-primary to-primary-light text-white'
            )}
          >
            {isAdmin ? <Shield size={24} /> : <User size={24} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-title-sm font-semibold text-on-surface-light dark:text-on-surface-dark truncate">
              {user?.name}
            </h3>
            <p className="text-body-sm text-gray-500 truncate">{user?.email}</p>
            <span
              className={cn(
                'inline-block mt-1 px-2 py-0.5 rounded-full text-label-sm font-medium',
                isAdmin
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-primary-50 text-primary dark:bg-primary-900/30 dark:text-primary-300'
              )}
            >
              {isAdmin ? 'Administrator' : 'User'}
            </span>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="w-full justify-center" onClick={logout}>
          <LogOut size={16} />
          Switch Account
        </Button>
      </div>

      {/* Admin Permissions */}
      {isAdmin && (
        <div className="mb-4">
          <h4 className="text-label-lg font-medium text-gray-500 mb-2 px-1">Admin Capabilities</h4>
          <div className="space-y-1">
            <PermissionItem icon={<Layout size={16} />} label="Manage Elements" enabled />
            <PermissionItem icon={<Palette size={16} />} label="Manage Palettes" enabled />
            <PermissionItem icon={<Type size={16} />} label="Manage Layouts" enabled />
          </div>
        </div>
      )}

      {/* Editor Settings */}
      <div className="mb-4">
        <h4 className="text-label-lg font-medium text-gray-500 mb-2 px-1">Editor</h4>
        <div className="space-y-1">
          <SettingToggle
            icon={<Grid3x3 size={16} />}
            label="Show Grid"
            enabled={user?.preferences.editorSettings.showGrid ?? true}
          />
          <SettingToggle
            icon={<Magnet size={16} />}
            label="Snap to Grid"
            enabled={user?.preferences.editorSettings.snapToGrid ?? true}
          />
          <SettingToggle
            icon={<Save size={16} />}
            label="Auto Save"
            enabled={user?.preferences.editorSettings.autoSave ?? true}
          />
        </div>
      </div>

      {/* Quick Links for Admin */}
      {isAdmin && (
        <div>
          <h4 className="text-label-lg font-medium text-gray-500 mb-2 px-1">Admin Tools</h4>
          <div className="space-y-1">
            <QuickLink label="Element Library" />
            <QuickLink label="Color Palettes" />
            <QuickLink label="Layout Templates" />
          </div>
        </div>
      )}
    </div>
  );
}

function LoginPanel() {
  const { loginAsAdmin, loginAsUser } = useAuthStore();

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
          <LogIn size={32} className="text-white" />
        </div>
        <h3 className="text-title-md font-semibold text-on-surface-light dark:text-on-surface-dark">
          Welcome to AI Editor
        </h3>
        <p className="text-body-sm text-gray-500 mt-1">
          Choose a role to continue
        </p>
      </div>

      <div className="space-y-3">
        {/* Admin Login */}
        <button
          onClick={loginAsAdmin}
          className={cn(
            'w-full p-4 rounded-material-lg text-left',
            'border-2 border-amber-200 dark:border-amber-800',
            'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
            'hover:border-amber-400 dark:hover:border-amber-600',
            'hover:shadow-material-2',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-title-sm font-semibold text-amber-700 dark:text-amber-400">
                Admin User
              </h4>
              <p className="text-body-sm text-amber-600/70 dark:text-amber-500/70">
                Create & manage elements, palettes
              </p>
            </div>
            <ChevronRight size={20} className="text-amber-400" />
          </div>
        </button>

        {/* Regular User Login */}
        <button
          onClick={loginAsUser}
          className={cn(
            'w-full p-4 rounded-material-lg text-left',
            'border-2 border-primary-100 dark:border-primary-800',
            'bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20',
            'hover:border-primary dark:hover:border-primary-600',
            'hover:shadow-material-2',
            'transition-all duration-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-title-sm font-semibold text-primary dark:text-primary-300">
                Demo User
              </h4>
              <p className="text-body-sm text-primary/70 dark:text-primary-400/70">
                Build websites using elements
              </p>
            </div>
            <ChevronRight size={20} className="text-primary" />
          </div>
        </button>
      </div>

      <p className="text-center text-body-sm text-gray-400 mt-6">
        This is a demo. No password required.
      </p>
    </div>
  );
}

interface ThemeButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function ThemeButton({ icon, label, isActive, onClick }: ThemeButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-material-sm',
        'transition-all duration-150',
        isActive
          ? 'bg-primary text-white shadow-material-1'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
      )}
    >
      {icon}
      <span className="text-label-sm">{label}</span>
    </button>
  );
}

interface SettingToggleProps {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}

function SettingToggle({ icon, label, enabled }: SettingToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  return (
    <button
      onClick={() => setIsEnabled(!isEnabled)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-material-sm',
        'hover:bg-gray-50 dark:hover:bg-gray-800',
        'transition-colors duration-150'
      )}
    >
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1 text-left text-body-md text-on-surface-light dark:text-on-surface-dark">
        {label}
      </span>
      <div
        className={cn(
          'w-10 h-6 rounded-full p-0.5 transition-colors duration-200',
          isEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
        )}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            isEnabled && 'translate-x-4'
          )}
        />
      </div>
    </button>
  );
}

interface PermissionItemProps {
  icon: React.ReactNode;
  label: string;
  enabled: boolean;
}

function PermissionItem({ icon, label, enabled }: PermissionItemProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-material-sm bg-green-50 dark:bg-green-900/20">
      <span className="text-green-600 dark:text-green-400">{icon}</span>
      <span className="flex-1 text-body-sm text-green-700 dark:text-green-400">{label}</span>
      <span className="text-label-sm text-green-600 dark:text-green-500">✓ Enabled</span>
    </div>
  );
}

interface QuickLinkProps {
  label: string;
}

function QuickLink({ label }: QuickLinkProps) {
  return (
    <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-material-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
      <span className="text-body-md text-on-surface-light dark:text-on-surface-dark">{label}</span>
      <ChevronRight size={16} className="text-gray-400" />
    </button>
  );
}

