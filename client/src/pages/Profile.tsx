import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState } from '../redux/store';
import { logout } from '../redux/slices/authSlice';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import {
  User, FileText, MapPin, ShieldCheck, LogOut,
  Mail, Phone, Package, Heart, Star, Calendar,
  UserCheck, Plus, Lock, UserCog, Settings, Eye, EyeOff,
  CheckCircle2, Trash2, Edit3, Home, Briefcase
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Address {
  id: number;
  label: string;
  icon: typeof Home;
  name: string;
  line1: string;
  city: string;
  country: string;
  isDefault: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_ADDRESSES: Address[] = [
  {
    id: 1,
    label: 'Home Address',
    icon: Home,
    name: 'Jonathan Wright',
    line1: '1234 Emerald Avenue, Suite 400',
    city: 'San Francisco, 94105',
    country: 'United States',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Office',
    icon: Briefcase,
    name: 'Jonathan Wright',
    line1: '500 Howard St, Suite 100',
    city: 'San Francisco, 94105',
    country: 'United States',
    isDefault: false,
  },
];

// ─── ChevronRight mini icon ────────────────────────────────────────────────────
const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

// ─── Animated field wrapper ────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

// ─── Input component ──────────────────────────────────────────────────────────
const FormInput = ({
  label, type = 'text', value, onChange, placeholder, optional, rightEl,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; optional?: boolean; rightEl?: React.ReactNode;
}) => (
  <div>
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
      {label}{optional && <span className="font-normal normal-case ml-1 text-muted-foreground/60">(optional)</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
      />
      {rightEl && <div className="absolute inset-y-0 right-3 flex items-center">{rightEl}</div>}
    </div>
  </div>
);

// ─── Section: Profile Overview ────────────────────────────────────────────────
const ProfileOverview = ({ user, onLogout }: { user: { name?: string; email?: string; avatar?: string } | null; onLogout: () => void }) => (
  <motion.div {...fadeUp} className="space-y-6">
    {/* Header card */}
    <div className="border rounded-xl bg-card shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
      <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 shadow-sm">
        {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <User className="h-10 w-10 text-slate-400 dark:text-slate-500" />}
      </div>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold">{user?.name || 'Jonathan Wright'}</h1>
          <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/50 tracking-wider">Platinum Member</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Welcome back! You've been a member since July 2022.</p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{user?.email || 'j.wright@example.com'}</span>
          <span className="flex items-center gap-2"><Phone className="h-4 w-4" />+1 (555) 012-3456</span>
        </div>
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { icon: Package, bg: 'bg-blue-50 dark:bg-blue-900/20', color: 'text-blue-500 dark:text-blue-400', value: '24', label: 'Total Orders' },
        { icon: Heart, bg: 'bg-pink-50 dark:bg-pink-900/20', color: 'text-pink-500 dark:text-pink-400', value: '12', label: 'Wishlist Items' },
        { icon: MapPin, bg: 'bg-green-50 dark:bg-green-900/20', color: 'text-green-500 dark:text-green-400', value: '2', label: 'Saved Addresses' },
        { icon: Star, bg: 'bg-yellow-50 dark:bg-yellow-900/20', color: 'text-yellow-500 dark:text-yellow-400', value: '85%', label: 'Profile Status', progress: 85 },
      ].map(({ icon: Icon, bg, color, value, label, progress }) => (
        <div key={label} className="border rounded-xl bg-card shadow-sm p-5 flex flex-col justify-between">
          <div className={`h-8 w-8 rounded-full ${bg} ${color} flex items-center justify-center mb-4`}><Icon className="h-4 w-4" /></div>
          <div>
            <h4 className="text-2xl font-bold leading-none mb-1">{value}</h4>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">{label}</p>
            {progress !== undefined && (
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    {/* Personal info display */}
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1">Personal Information</h3>
          <p className="text-sm text-muted-foreground">Manage your identity and contact details.</p>
        </div>
        <Button variant="outline" size="sm" className="h-8">Edit Profile</Button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {[
          { icon: User, label: 'Full Name', value: user?.name || 'Jonathan Wright' },
          { icon: Mail, label: 'Email Address', value: user?.email || 'j.wright@example.com' },
          { icon: Phone, label: 'Phone Number', value: '+1 (555) 012-3456' },
          { icon: UserCheck, label: 'Gender', value: 'Male' },
          { icon: Calendar, label: 'Date of Birth', value: 'January 15, 1992' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex gap-4">
            <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{label}</p>
              <p className="font-medium text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Split: addresses + account mgmt */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Addresses preview */}
      <div>
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 px-1"><MapPin className="h-5 w-5" />Address Information</h3>
        <div className="border rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0">
            <span className="bg-blue-600 text-white text-[9px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-wider">Default</span>
          </div>
          <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400"><MapPin className="h-3 w-3" /></div>
            Home Address
          </h4>
          <div className="text-sm text-muted-foreground space-y-0.5 pl-7 mb-4">
            <p className="font-medium text-foreground">{user?.name || 'Jonathan Wright'}</p>
            <p>1234 Emerald Avenue, Suite 400</p>
            <p>San Francisco, 94105</p>
            <p>United States</p>
          </div>
        </div>
      </div>

      {/* Account Management */}
      <div>
        <h3 className="font-bold text-lg flex items-center gap-2 mb-4 px-1"><Settings className="h-5 w-5" />Account Management</h3>
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-800/30">
            <h4 className="font-bold text-sm mb-1">Account Settings</h4>
            <p className="text-xs text-muted-foreground">Quick actions to manage your account.</p>
          </div>
          <div className="divide-y">
            {[
              { icon: Lock, label: 'Change Password', sub: 'Last updated 3 months ago' },
              { icon: UserCog, label: 'Update Profile Information', sub: 'Email, phone, and name' },
              { icon: MapPin, label: 'Manage Addresses', sub: 'Add or remove delivery locations' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 dark:hover:bg-slate-800/50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0"><Icon className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold text-sm mb-0.5">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
              </div>
            ))}
            <button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors text-left group">
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0"><LogOut className="h-4 w-4" /></div>
                <div>
                  <p className="font-bold text-sm mb-0.5 text-red-600 dark:text-red-400">Logout</p>
                  <p className="text-xs text-red-500/70 dark:text-red-400/70">Securely sign out of your account</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-red-300 opacity-50" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Rewards banner */}
    <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 p-8 sm:p-10 text-white relative overflow-hidden shadow-lg">
      <div className="relative z-10 max-w-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">You're 250 points away from Diamond!</h2>
        <p className="text-blue-100 mb-8 text-sm sm:text-base">Upgrade to our highest tier to unlock free international shipping, early access to new drops, and a dedicated concierge.</p>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 shadow-sm">View My Rewards</Button>
          <Button variant="outline" className="border-blue-300 text-white hover:bg-blue-500/50 bg-transparent font-medium">How it works</Button>
        </div>
      </div>
      <div className="absolute -right-8 -top-8 opacity-20 pointer-events-none transform rotate-12 scale-150">
        <Star className="w-64 h-64 text-white stroke-2" fill="currentColor" />
      </div>
    </div>
  </motion.div>
);

// ─── Section: Personal Details ─────────────────────────────────────────────────
const PersonalDetails = ({ user }: { user: { name?: string; email?: string } | null }) => {
  const nameParts = (user?.name || 'Jonathan Wright').split(' ');
  const [form, setForm] = useState({
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    email: user?.email || 'j.wright@example.com',
    phone: '+1 (555) 012-3456',
    gender: 'Male',
    dob: '1992-01-15',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/40 dark:bg-slate-800/30">
          <h2 className="font-bold text-xl mb-1">Personal Details</h2>
          <p className="text-sm text-muted-foreground">Update your personal information. Changes are saved immediately.</p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput label="First Name" value={form.firstName} onChange={v => setForm(f => ({ ...f, firstName: v }))} placeholder="Jonathan" />
            <FormInput label="Last Name" value={form.lastName} onChange={v => setForm(f => ({ ...f, lastName: v }))} placeholder="Wright" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput label="Email Address" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" />
            <FormInput label="Phone Number" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                Gender <span className="font-normal normal-case text-muted-foreground/60">(optional)</span>
              </label>
              <select
                value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <FormInput label="Date of Birth" type="date" value={form.dob} onChange={v => setForm(f => ({ ...f, dob: v }))} optional />
          </div>

          <div className="flex items-center gap-4 pt-2 border-t">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">Save Changes</Button>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Changes saved!
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// ─── Section: Saved Addresses ─────────────────────────────────────────────────
const SavedAddresses = ({ user }: { user: { name?: string } | null }) => {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [newAddr, setNewAddr] = useState({ label: '', line1: '', city: '', country: 'United States' });

  const setDefault = (id: number) => setAddresses(a => a.map(addr => ({ ...addr, isDefault: addr.id === id })));
  const deleteAddr = (id: number) => setAddresses(a => a.filter(addr => addr.id !== id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId !== null) {
      setAddresses(a => a.map(addr => addr.id === editId ? { ...addr, label: newAddr.label, line1: newAddr.line1, city: newAddr.city, country: newAddr.country } : addr));
      setEditId(null);
    } else {
      setAddresses(a => [...a, { id: Date.now(), label: newAddr.label || 'New Address', icon: Home, name: user?.name || 'Jonathan Wright', line1: newAddr.line1, city: newAddr.city, country: newAddr.country, isDefault: false }]);
    }
    setNewAddr({ label: '', line1: '', city: '', country: 'United States' });
    setShowForm(false);
  };

  const startEdit = (addr: Address) => {
    setEditId(addr.id);
    setNewAddr({ label: addr.label, line1: addr.line1, city: addr.city, country: addr.country });
    setShowForm(true);
  };

  return (
    <motion.div {...fadeUp} className="space-y-6">
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/40 dark:bg-slate-800/30 flex justify-between items-start">
          <div>
            <h2 className="font-bold text-xl mb-1">Saved Addresses</h2>
            <p className="text-sm text-muted-foreground">Manage your delivery and billing addresses.</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setNewAddr({ label: '', line1: '', city: '', country: 'United States' }); }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-9">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Add / Edit form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <form onSubmit={handleSave} className="border rounded-xl p-5 bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50 space-y-4 mb-4">
                  <h4 className="font-bold text-sm">{editId ? 'Edit Address' : 'Add New Address'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Label (e.g. Home, Office)" value={newAddr.label} onChange={v => setNewAddr(a => ({ ...a, label: v }))} placeholder="Home Address" />
                    <FormInput label="Street Address" value={newAddr.line1} onChange={v => setNewAddr(a => ({ ...a, line1: v }))} placeholder="123 Main St, Suite 4" />
                    <FormInput label="City, State & ZIP" value={newAddr.city} onChange={v => setNewAddr(a => ({ ...a, city: v }))} placeholder="San Francisco, CA 94105" />
                    <FormInput label="Country" value={newAddr.country} onChange={v => setNewAddr(a => ({ ...a, country: v }))} placeholder="United States" />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{editId ? 'Update Address' : 'Save Address'}</Button>
                    <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Address list */}
          <AnimatePresence>
            {addresses.map(addr => {
              const Icon = addr.icon;
              return (
                <motion.div key={addr.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                  className={`border rounded-xl p-5 relative overflow-hidden transition-colors ${addr.isDefault ? 'bg-blue-50/40 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50' : 'bg-card'}`}>
                  {addr.isDefault && (
                    <div className="absolute top-0 right-0">
                      <span className="bg-blue-600 text-white text-[9px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-wider">Default</span>
                    </div>
                  )}
                  <h4 className="font-bold text-sm mb-2 flex items-center gap-2">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ${addr.isDefault ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    {addr.label}
                  </h4>
                  <div className="text-sm text-muted-foreground space-y-0.5 pl-7 mb-4">
                    <p className="font-medium text-foreground">{addr.name}</p>
                    <p>{addr.line1}</p>
                    <p>{addr.city}</p>
                    <p>{addr.country}</p>
                  </div>
                  <div className="flex justify-between items-center pl-7">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(addr)} className="text-blue-600 hover:underline text-xs font-medium flex items-center gap-1"><Edit3 className="h-3 w-3" />Edit</button>
                      <button onClick={() => deleteAddr(addr.id)} className="text-red-500 hover:underline text-xs font-medium flex items-center gap-1"><Trash2 className="h-3 w-3" />Delete</button>
                    </div>
                    {!addr.isDefault && (
                      <button onClick={() => setDefault(addr.id)} className="text-muted-foreground hover:text-blue-600 text-xs font-medium transition-colors">Set as Default</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {addresses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No addresses saved yet.</p>
              <p className="text-sm mt-1">Click "Add New" to save your first delivery address.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Section: Account Security ────────────────────────────────────────────────
const AccountSecurity = () => {
  const [form, setForm] = useState({ current: '', newPwd: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPwd: false, confirm: false });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const strength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
    return { score, label: map[score], color: colors[score] };
  };

  const pwdStrength = strength(form.newPwd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.current) { setError('Please enter your current password.'); return; }
    if (form.newPwd.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.newPwd !== form.confirm) { setError('New passwords do not match.'); return; }
    setSaved(true);
    setForm({ current: '', newPwd: '', confirm: '' });
    setTimeout(() => setSaved(false), 4000);
  };

  const ToggleBtn = ({ field }: { field: 'current' | 'newPwd' | 'confirm' }) => (
    <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))} className="text-muted-foreground hover:text-foreground transition-colors">
      {show[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <motion.div {...fadeUp} className="space-y-6">
      {/* Change Password */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50/40 dark:bg-slate-800/30">
          <h2 className="font-bold text-xl mb-1">Account Security</h2>
          <p className="text-sm text-muted-foreground">Keep your account safe by using a strong password.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormInput
            label="Current Password"
            type={show.current ? 'text' : 'password'}
            value={form.current}
            onChange={v => setForm(f => ({ ...f, current: v }))}
            placeholder="Enter your current password"
            rightEl={<ToggleBtn field="current" />}
          />
          <div>
            <FormInput
              label="New Password"
              type={show.newPwd ? 'text' : 'password'}
              value={form.newPwd}
              onChange={v => setForm(f => ({ ...f, newPwd: v }))}
              placeholder="Min. 8 characters"
              rightEl={<ToggleBtn field="newPwd" />}
            />
            {form.newPwd && (
              <div className="mt-2 flex items-center gap-3">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength.score ? pwdStrength.color : 'bg-slate-100 dark:bg-slate-800'}`} />
                  ))}
                </div>
                <span className={`text-xs font-medium ${pwdStrength.score >= 3 ? 'text-green-600' : pwdStrength.score === 2 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {pwdStrength.label}
                </span>
              </div>
            )}
          </div>
          <FormInput
            label="Confirm New Password"
            type={show.confirm ? 'text' : 'password'}
            value={form.confirm}
            onChange={v => setForm(f => ({ ...f, confirm: v }))}
            placeholder="Repeat your new password"
            rightEl={<ToggleBtn field="confirm" />}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error}</div>
          )}

          <div className="flex items-center gap-4 pt-1 border-t">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">Update Password</Button>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Password updated!
              </motion.span>
            )}
          </div>
        </form>
      </div>

      {/* Security tips */}
      <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-slate-50/40 dark:bg-slate-800/30">
          <h3 className="font-bold text-base mb-1">Security Tips</h3>
          <p className="text-xs text-muted-foreground">Follow these guidelines to keep your account secure.</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            'Use at least 8 characters with a mix of letters, numbers, and symbols.',
            'Never share your password with anyone.',
            'Use a unique password that you don\'t use on other websites.',
            'Enable two-factor authentication for extra security.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">{i + 1}</div>
              <p className="text-muted-foreground">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview', label: 'Profile Overview', icon: User },
  { id: 'details', label: 'Personal Details', icon: FileText },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'security', label: 'Account Security', icon: ShieldCheck },
] as const;

type NavId = typeof NAV[number]['id'];

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Profile() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [activeSection, setActiveSection] = useState<NavId>('overview');

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => dispatch(logout());

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':  return <ProfileOverview user={user} onLogout={handleLogout} />;
      case 'details':   return <PersonalDetails user={user} />;
      case 'addresses': return <SavedAddresses user={user} />;
      case 'security':  return <AccountSecurity />;
      default:          return null;
    }
  };

  return (
    <PageTransition>
      <div className="bg-muted/10 min-h-screen pb-20 pt-8">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── SIDEBAR ─────────────────────────────────────────── */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="border rounded-xl bg-card shadow-sm flex flex-col p-4 sticky top-24">
                {/* User snippet */}
                <div className="flex items-center gap-4 mb-6 px-2 pt-2">
                  <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                    {user?.avatar
                      ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      : <User className="h-6 w-6 text-slate-400 dark:text-slate-500" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm leading-tight truncate">{user?.name || 'Jonathan Wright'}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Member since 2022</span>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col space-y-1">
                  {NAV.map(({ id, label, icon: Icon }) => {
                    const active = activeSection === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          active
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-muted-foreground hover:bg-muted/50 dark:hover:bg-slate-800/50 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-3"><Icon className="h-4 w-4" />{label}</span>
                        {active && <ChevronRight className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </nav>

                {/* Sign Out */}
                <div className="mt-8 mb-2 px-3 pt-4 border-t">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <div key={activeSection}>
                  {renderSection()}
                </div>
              </AnimatePresence>
            </main>

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
