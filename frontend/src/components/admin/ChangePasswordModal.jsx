import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL || ''}/api`;

const ChangePasswordModal = ({ open, onClose, onPasswordChanged }) => {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwVisible, setPwVisible] = useState({ current: false, newPw: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (pwForm.newPw.length < 8) {
      toast({ title: 'Password too short', description: 'Must be at least 8 characters', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/auth/change-password`, {
        current_password: pwForm.current,
        new_password: pwForm.newPw,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Password changed!', description: 'Your account is now secured.' });
      setPwForm({ current: '', newPw: '', confirm: '' });
      onPasswordChanged?.();
      onClose();
    } catch (error) {
      toast({ title: 'Failed', description: error.response?.data?.detail || 'Could not change password', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'current', label: 'Current Password', placeholder: 'Enter current password', testid: 'current-password-input' },
    { key: 'newPw', label: 'New Password', placeholder: 'At least 8 characters', testid: 'new-password-input' },
    { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password', testid: 'confirm-password-input' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Change Password"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div data-testid="change-password-modal" className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Change Password</h3>
              <p className="text-gray-400 text-xs">Secure your admin account</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, placeholder, testid }) => (
            <div key={key} className="space-y-1">
              <Label className="text-gray-300 text-sm">{label}</Label>
              <div className="relative">
                <Input
                  type={pwVisible[key] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder={placeholder}
                  required
                  data-testid={testid}
                  className="bg-white/[0.04] border-white/[0.08] text-white pr-10"
                />
                <button
                  type="button"
                  onClick={() => setPwVisible(prev => ({ ...prev, [key]: !prev[key] }))}
                  aria-label={pwVisible[key] ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {pwVisible[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving}
              data-testid="save-password-btn"
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-semibold"
            >
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Change Password'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-white/20">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
