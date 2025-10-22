import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icon } from './Icon';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, logout, changePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state on close
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            <button onClick={handleClose}><Icon name="close" className="w-6 h-6"/></button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-[var(--text-secondary)]">Email</p>
          <p className="font-medium">{user?.email}</p>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="font-semibold border-b border-[var(--bg-default)] pb-2">Change Password</h3>
            <div>
                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Current Password</label>
                 <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required className="w-full px-3 py-2 bg-[var(--bg-default)] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
             <div>
                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">New Password</label>
                 <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 bg-[var(--bg-default)] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
             <div>
                 <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Confirm New Password</label>
                 <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 bg-[var(--bg-default)] border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-semibold text-white bg-[var(--accent)] rounded-md hover:opacity-90 disabled:bg-[var(--text-secondary)]">
                {isLoading ? "Saving..." : "Save Changes"}
            </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--bg-default)] flex justify-end">
            <button onClick={logout} className="px-4 py-2 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/40 font-semibold">Logout</button>
        </div>
      </div>
    </div>
  );
};