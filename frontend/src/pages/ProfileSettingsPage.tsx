import React, { useState } from 'react';
import { Save, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [headline, setHeadline] = useState(user?.headline || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile details saved successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    toast.success('Account password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account profile, headline, and credential security
        </p>
      </div>

      {/* Profile Details Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-base font-bold text-slate-900">Personal Information</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <Input
            label="Email (Immutable)"
            type="email"
            disabled
            value={user?.email || ''}
            className="cursor-not-allowed bg-slate-50 text-slate-500"
          />

          <Input
            label="Headline / Bio"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Aspiring Cloud Native & .NET Developer"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="text-base font-bold text-slate-900">Change Password</h3>
        </div>

        <form onSubmit={handleSavePassword} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="secondary"
              size="md"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
