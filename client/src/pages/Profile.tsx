import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootState, AppDispatch } from '../redux/store';
import { logout, updateAuthUser } from '../redux/slices/authSlice';
import { clearCartState } from '../redux/slices/cartSlice';
import { clearWishlistState } from '../redux/slices/wishlistSlice';
import { showError, showSuccess } from '../redux/slices/uiSlice';
import { profileService, orderService } from '../services';
import { getApiErrorMessage } from '../lib/errors';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import type { ApiAddress, UserProfile } from '../types/api';
import type { AuthUser } from '../redux/slices/authSlice';
import type { IAddress, IChangePassword, IUpdateProfile } from '../types/user.types';
import {
  User, FileText, MapPin, ShieldCheck, LogOut,
  Mail, Package, Heart, Star,
  Plus, Lock, UserCog, Eye, EyeOff,
  CheckCircle2, Trash2, Edit3, Home
} from 'lucide-react';

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25 },
};

const FormInput = ({
  label, type = 'text', value, onChange, placeholder, optional, rightEl, name,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; optional?: boolean; rightEl?: React.ReactNode; name?: string;
}) => (
  <div>
    <label className="block text-xs font-semibold text-muted-foreground/80 tracking-wide mb-1.5">
      {label}{optional && <span className="font-normal ml-1 text-muted-foreground/50">(optional)</span>}
    </label>
    <div className="relative">
      <input
        name={name || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}
        type={type}
        required={!optional}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 rounded-lg border border-input/60 bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/60 transition-all"
      />
      {rightEl && <div className="absolute inset-y-0 right-3 flex items-center">{rightEl}</div>}
    </div>
  </div>
);

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword';

const PasswordToggle = ({
  field,
  visible,
  onToggle,
}: {
  field: PasswordField;
  visible: boolean;
  onToggle: (field: PasswordField) => void;
}) => (
  <button
    type="button"
    onClick={() => onToggle(field)}
    className="text-muted-foreground/50 hover:text-foreground transition-colors"
  >
    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

const ProfileOverview = ({
  user,
  onLogout,
  addresses,
  onNavigate,
  stats,
}: {
  user: AuthUser | null;
  onLogout: () => void;
  addresses: ApiAddress[];
  onNavigate: (section: NavId) => void;
  stats: { orders: number; wishlist: number; addresses: number };
}) => (
  <motion.div {...fadeUp} className="space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8">
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_30%_50%,white,transparent_50%)]" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 ring-4 ring-white/10">
          {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700/50 flex items-center justify-center"><User className="h-10 w-10 text-slate-400" /></div>}
        </div>
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{user?.name || 'User'}</h1>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border border-blue-400/20 tracking-wider backdrop-blur-sm">
              {user?.role || 'Customer'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-sm text-slate-400 mt-1">
            <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{user?.email || ''}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { icon: Package, value: String(stats.orders), label: 'Total Orders', accent: 'from-blue-500/10 to-transparent' },
        { icon: Heart, value: String(stats.wishlist), label: 'Wishlist', accent: 'from-pink-500/10 to-transparent' },
        { icon: MapPin, value: String(stats.addresses), label: 'Addresses', accent: 'from-green-500/10 to-transparent' },
        { icon: Star, value: '85%', label: 'Profile Status', progress: 85, accent: 'from-yellow-500/10 to-transparent' },
      ].map(({ icon: Icon, value, label, progress, accent }) => (
        <div key={label} className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${accent} p-5`}>
          <div className="relative">
            <div className="h-8 w-8 rounded-lg bg-background/60 backdrop-blur flex items-center justify-center mb-3 text-foreground/70"><Icon className="h-4 w-4" /></div>
            <h4 className="text-2xl font-bold leading-none mb-1">{value}</h4>
            <p className="text-[10px] text-muted-foreground/70 uppercase font-semibold tracking-wider mb-2">{label}</p>
            {progress !== undefined && (
              <div className="w-full bg-background/60 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">Personal Information</h3>
          <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => onNavigate('details')}>Edit</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: User, label: 'Full Name', value: user?.name || '' },
            { icon: Mail, label: 'Email Address', value: user?.email || '' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-[10px] text-muted-foreground/60 uppercase font-semibold tracking-wider mb-0.5">{label}</p>
                <p className="font-medium text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base">Default Address</h3>
          <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => onNavigate('addresses')}>Manage</Button>
        </div>
        {(() => {
          const address = addresses.find((item) => item.isDefault) || addresses[0];
          return address ? (
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{address.fullName || user?.name || 'User'}</p>
              <p>{address.street}</p>
              <p>{address.city}, {address.state} {address.postalCode}</p>
              <p>{address.country}</p>
              {address.phone && <p>{address.phone}</p>}
            </div>
          ) : (
            <div className="py-4 text-sm text-muted-foreground">
              No saved address yet.
              <Button variant="link" className="ml-1 h-auto p-0" onClick={() => onNavigate('addresses')}>Add one</Button>
            </div>
          );
        })()}
      </div>
    </div>

    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
      <div className="divide-y divide-border/50">
        {[
          { icon: Lock, label: 'Change Password', sub: 'Update your account password', section: 'security' as const, color: 'text-blue-500 bg-blue-500/10' },
          { icon: UserCog, label: 'Update Profile', sub: 'Email, phone, and name', section: 'details' as const, color: 'text-purple-500 bg-purple-500/10' },
          { icon: MapPin, label: 'Manage Addresses', sub: 'Add or remove delivery locations', section: 'addresses' as const, color: 'text-green-500 bg-green-500/10' },
        ].map(({ icon: Icon, label, sub, section, color }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(section)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/30 dark:hover:bg-slate-800/30 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-sm">{label}</p>
                <p className="text-xs text-muted-foreground/60">{sub}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
          </button>
        ))}
        <button onClick={onLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors text-left group">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0"><LogOut className="h-4 w-4" /></div>
            <div>
              <p className="font-medium text-sm text-red-600 dark:text-red-400">Logout</p>
              <p className="text-xs text-red-500/50">Securely sign out</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-red-300/50" />
        </button>
      </div>
    </div>

    <div className="rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_80%,white,transparent_50%)]" />
      <div className="relative z-10 max-w-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">You're 250 points away from Diamond!</h2>
        <p className="text-blue-100/80 mb-6 text-sm">Unlock free international shipping, early access, and a dedicated concierge.</p>
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 shadow-lg shadow-blue-900/20">View Rewards</Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent">How it works</Button>
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
        <Star className="w-48 h-48 text-white" fill="currentColor" />
      </div>
    </div>
  </motion.div>
);

const PersonalDetails = ({
  profile,
  onProfileChange,
}: {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [form, setForm] = useState<IUpdateProfile>({
    fullName: profile.username,
    email: profile.email,
    phone: profile.phone || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | undefined>();
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile = await profileService.updateProfile(form, avatarFile);
      onProfileChange(updatedProfile);
      dispatch(updateAuthUser({
        name: updatedProfile.username,
        email: updatedProfile.email,
        avatar: updatedProfile.profileImg,
      }));
      dispatch(showSuccess('Profile updated successfully.'));
      setForm({
        fullName: updatedProfile.username,
        email: updatedProfile.email,
        phone: updatedProfile.phone || '',
      });
      setAvatarFile(undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to update profile.')));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div {...fadeUp}>
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="font-semibold text-lg mb-1">Personal Details</h2>
          <p className="text-sm text-muted-foreground/70">Update your personal information. Changes are saved immediately.</p>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput label="Full Name" value={form.fullName || ''} onChange={v => setForm(f => ({ ...f, fullName: v }))} placeholder="Jonathan Wright" />
            <FormInput label="Phone Number" value={form.phone || ''} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="+1 555 0100" optional />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormInput label="Email Address" type="email" value={form.email || ''} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="you@example.com" />
            <div>
              <label htmlFor="profile-image" className="block text-xs font-semibold text-muted-foreground/80 tracking-wide mb-1.5">Profile Picture</label>
              <input id="profile-image" name="avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setAvatarFile(event.target.files?.[0])} className="w-full rounded-lg border border-input/60 bg-background/60 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:font-medium file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300" />
              <p className="mt-1.5 text-xs text-muted-foreground/50">JPG, PNG, or WebP; up to 5 MB.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-border/50">
            <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8">{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Saved!
              </motion.span>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

const emptyAddress = (fullName = ''): IAddress => ({
  fullName,
  phone: '',
  country: '',
  city: '',
  state: '',
  street: '',
  postalCode: '',
  addressType: 'home',
  isDefault: false,
});

const SavedAddresses = ({
  profile,
  onProfileChange,
}: {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newAddr, setNewAddr] = useState<IAddress>(() => emptyAddress(profile.username));
  const [isSaving, setIsSaving] = useState(false);
  const addresses = profile.addresses || [];

  const addressPayload = (address: ApiAddress): IAddress => ({
    fullName: address.fullName || profile.username,
    phone: address.phone || profile.phone || '',
    street: address.street,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    addressType: address.addressType || 'home',
    isDefault: address.isDefault || false,
  });

  const deleteAddr = async (addressId: string) => {
    try {
      const updatedProfile = await profileService.deleteAddress(addressId);
      onProfileChange(updatedProfile);
      dispatch(showSuccess('Address deleted.'));
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to delete address.')));
    }
  };

  const setDefault = async (address: ApiAddress) => {
    if (!address._id) return;
    try {
      const updatedProfile = await profileService.updateAddress(
        address._id,
        { ...addressPayload(address), isDefault: true },
      );
      onProfileChange(updatedProfile);
      dispatch(showSuccess('Default address updated.'));
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to update default address.')));
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updatedProfile = editId
        ? await profileService.updateAddress(editId, newAddr)
        : await profileService.addAddress(newAddr);
      onProfileChange(updatedProfile);
      setNewAddr(emptyAddress(profile.username));
      setShowForm(false);
      setEditId(null);
      dispatch(showSuccess(editId ? 'Address updated.' : 'Address added.'));
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to save address.')));
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (address: ApiAddress) => {
    setEditId(address._id || null);
    setNewAddr(addressPayload(address));
    setShowForm(true);
  };

  return (
    <motion.div {...fadeUp}>
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-start">
          <div>
            <h2 className="font-semibold text-lg mb-1">Saved Addresses</h2>
            <p className="text-sm text-muted-foreground/70">Manage your delivery and billing addresses.</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditId(null); setNewAddr({ ...emptyAddress(profile.username), isDefault: addresses.length === 0 }); }} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 h-9">
            <Plus className="h-4 w-4" /> Add New
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <form onSubmit={handleSave} className="rounded-xl border border-blue-200/50 dark:border-blue-800/30 p-5 bg-blue-50/30 dark:bg-blue-900/10 space-y-4 mb-4">
                  <h4 className="font-semibold text-sm">{editId ? 'Edit Address' : 'Add New Address'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Full Name" value={newAddr.fullName} onChange={v => setNewAddr(a => ({ ...a, fullName: v }))} placeholder={profile.username} />
                    <FormInput label="Phone Number" value={newAddr.phone} onChange={v => setNewAddr(a => ({ ...a, phone: v }))} placeholder="+1 555 0100" />
                    <FormInput label="Street Address" value={newAddr.street} onChange={v => setNewAddr(a => ({ ...a, street: v }))} placeholder="123 Main St, Suite 4" />
                    <FormInput label="City" value={newAddr.city} onChange={v => setNewAddr(a => ({ ...a, city: v }))} placeholder="San Francisco" />
                    <FormInput label="State / Province" value={newAddr.state} onChange={v => setNewAddr(a => ({ ...a, state: v }))} placeholder="California" />
                    <FormInput label="Postal Code" value={newAddr.postalCode} onChange={v => setNewAddr(a => ({ ...a, postalCode: v }))} placeholder="94105" />
                    <FormInput label="Country" value={newAddr.country} onChange={v => setNewAddr(a => ({ ...a, country: v }))} placeholder="United States" />
                    <label className="block">
                      <span className="block text-xs font-semibold text-muted-foreground/80 tracking-wide mb-1.5">Address Type</span>
                      <select value={newAddr.addressType} onChange={(event) => setNewAddr((address) => ({ ...address, addressType: event.target.value as IAddress['addressType'] }))} className="w-full h-10 rounded-lg border border-input/60 bg-background/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-muted-foreground/70">
                    <input type="checkbox" checked={newAddr.isDefault} onChange={(event) => setNewAddr((address) => ({ ...address, isDefault: event.target.checked }))} />
                    Set as default address
                  </label>
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">{isSaving ? 'Saving...' : editId ? 'Update Address' : 'Save Address'}</Button>
                    <Button type="button" variant="outline" disabled={isSaving} onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {addresses.map((addr, index) => {
              const label = (addr.addressType || 'home').replace(/^./, (letter) => letter.toUpperCase());
              return (
                <motion.div key={addr._id || `${addr.street}-${index}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -8 }}
                  className={`relative rounded-xl border p-5 transition-colors ${addr.isDefault ? 'border-blue-200/60 dark:border-blue-800/40 bg-blue-50/20 dark:bg-blue-900/10' : 'border-border/50 bg-card/30'}`}>
                  {addr.isDefault && (
                    <div className="absolute top-0 right-0">
                      <span className="bg-blue-600 text-white text-[9px] uppercase font-bold px-3 py-1 rounded-bl-lg tracking-wider">Default</span>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      <Home className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{label} Address</h4>
                      <div className="text-sm text-muted-foreground/70 mt-1 space-y-0.5">
                        <p className="font-medium text-foreground/80">{addr.fullName || profile.username}</p>
                        {addr.phone && <p>{addr.phone}</p>}
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pl-11">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(addr)} className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center gap-1 transition-colors"><Edit3 className="h-3 w-3" />Edit</button>
                      <button onClick={() => addr._id && deleteAddr(addr._id)} className="text-red-500 hover:text-red-600 text-xs font-medium flex items-center gap-1 transition-colors"><Trash2 className="h-3 w-3" />Delete</button>
                    </div>
                    {!addr.isDefault && (
                      <button onClick={() => void setDefault(addr)} className="text-muted-foreground/50 hover:text-blue-600 text-xs font-medium transition-colors">Set as Default</button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {addresses.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/50">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-muted-foreground/70">No addresses saved yet.</p>
              <p className="text-sm mt-1">Click "Add New" to save your first delivery address.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AccountSecurity = () => {
  const [form, setForm] = useState<IChangePassword>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const pwdStrength = strength(form.newPassword);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return; }
    setIsUpdating(true);
    try {
      await profileService.changePassword(form);
      setSaved(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSaved(false), 4000);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Failed to update password.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = (field: PasswordField) => {
    setShow((s) => ({ ...s, [field]: !s[field] }));
  };

  return (
    <motion.div {...fadeUp} className="space-y-5">
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="font-semibold text-lg mb-1">Account Security</h2>
          <p className="text-sm text-muted-foreground/70">Keep your account safe by using a strong password.</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <FormInput
            label="Current Password"
            type={show.currentPassword ? 'text' : 'password'}
            value={form.currentPassword}
            onChange={v => setForm(f => ({ ...f, currentPassword: v }))}
            placeholder="Enter your current password"
            rightEl={<PasswordToggle field="currentPassword" visible={show.currentPassword} onToggle={handleToggle} />}
          />
          <div>
            <FormInput
              label="New Password"
              type={show.newPassword ? 'text' : 'password'}
              value={form.newPassword}
              onChange={v => setForm(f => ({ ...f, newPassword: v }))}
              placeholder="Min. 8 characters"
              rightEl={<PasswordToggle field="newPassword" visible={show.newPassword} onToggle={handleToggle} />}
            />
            {form.newPassword && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= pwdStrength.score ? pwdStrength.color : 'bg-slate-100 dark:bg-slate-800'}`} />
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
            type={show.confirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={v => setForm(f => ({ ...f, confirmPassword: v }))}
            placeholder="Repeat your new password"
            rightEl={<PasswordToggle field="confirmPassword" visible={show.confirmPassword} onToggle={handleToggle} />}
          />

          {error && (
            <div className="text-sm text-red-600 bg-red-50/80 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 rounded-lg px-4 py-2.5">{error}</div>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-border/50">
            <Button type="submit" disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700 text-white px-8">{isUpdating ? 'Updating...' : 'Update Password'}</Button>
            {saved && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle2 className="h-4 w-4" /> Updated!
              </motion.span>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h3 className="font-semibold text-sm mb-1">Security Tips</h3>
          <p className="text-xs text-muted-foreground/60">Follow these guidelines to keep your account secure.</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            'Use at least 8 characters with a mix of letters, numbers, and symbols.',
            'Never share your password with anyone.',
            'Use a unique password that you don\'t use on other websites.',
            'Enable two-factor authentication for extra security.',
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <div className="h-5 w-5 rounded-full bg-blue-100/60 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">{i + 1}</div>
              <p className="text-muted-foreground/70">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const NAV = [
  { id: 'overview', label: 'Profile Overview', icon: User },
  { id: 'details', label: 'Personal Details', icon: FileText },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'security', label: 'Account Security', icon: ShieldCheck },
] as const;

type NavId = typeof NAV[number]['id'];

export function Profile() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { productIds } = useSelector((state: RootState) => state.wishlist);
  const [activeSection, setActiveSection] = useState<NavId>('overview');
  const [stats, setStats] = useState({ orders: 0, wishlist: 0, addresses: 0 });
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    user
      ? {
        _id: user.id,
        username: user.name,
        email: user.email,
        role: user.role,
        isActive: true,
        profileImg: user.avatar,
        permissionCodes: user.permissions,
        addresses: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        }
      : null,
  );
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let isCurrent = true;
    profileService
      .getProfile()
      .then((nextProfile) => {
        if (isCurrent) setProfile(nextProfile);
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          dispatch(showError(getApiErrorMessage(error, 'Failed to load profile.')));
        }
      });

    orderService
      .getMyOrders()
      .then((orders) => {
        if (isCurrent) setStats((current) => ({ ...current, orders: orders.length }));
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          dispatch(showError(getApiErrorMessage(error, 'Failed to load order statistics.')));
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [dispatch, userId]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
  };

  const currentProfile = profile;

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <ProfileOverview
            user={user}
            onLogout={handleLogout}
            addresses={currentProfile?.addresses ?? []}
            onNavigate={setActiveSection}
            stats={{
              ...stats,
              wishlist: productIds.length,
              addresses: currentProfile?.addresses?.length ?? 0,
            }}
          />
        );
      case 'details':
        return currentProfile ? (
          <PersonalDetails profile={currentProfile} onProfileChange={setProfile} />
        ) : null;
      case 'addresses':
        return currentProfile ? (
          <SavedAddresses profile={currentProfile} onProfileChange={setProfile} />
        ) : null;
      case 'security':
        return <AccountSecurity />;
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen pb-20 pt-8 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="container max-w-screen-xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">

            <aside className="w-full lg:w-64 shrink-0">
              <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur flex flex-col p-4 sticky top-24">
                <div className="flex items-center gap-3 mb-6 px-2 pt-2">
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-border/50">
                    {user?.avatar
                      ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      : <User className="h-5 w-5 text-slate-400 dark:text-slate-500" />}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-sm leading-tight truncate">{user?.name || 'User'}</span>
                    <span className="text-[10px] text-muted-foreground/50 uppercase font-medium tracking-wider">{user?.role || 'Customer'}</span>
                  </div>
                </div>

                <nav className="flex flex-col space-y-0.5">
                  {NAV.map(({ id, label, icon: Icon }) => {
                    const active = activeSection === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          active
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                            : 'text-muted-foreground/70 hover:bg-muted/30 dark:hover:bg-slate-800/30 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" />{label}</span>
                        {active && <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-6 mb-2 px-3 pt-4 border-t border-border/50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-red-500/80 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              </div>
            </aside>

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
