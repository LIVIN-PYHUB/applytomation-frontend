import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import type { User } from '../types';
import { User as UserIcon, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import Toast from '../components/Toast';
import Loading, { LoadingSpinner } from '../components/Loading';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const response = await userApi.getProfile(userId);
      setUser(response.data);
      setFormData({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        location: response.data.location || '',
      });
      // Update admin status in localStorage
      if (response.data.is_admin) {
        localStorage.setItem('isAdmin', 'true');
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setToast({ message: `❌ Failed to load profile: ${error.response?.data?.detail || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      await userApi.updateProfile(userId, {
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
      });
      setEditing(false);
      setToast({ message: '✅ Profile updated successfully!', type: 'success' });
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setToast({ message: `❌ Failed to update profile: ${error.response?.data?.detail || 'Unknown error'}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
      <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
            <p className="text-gray-600 text-sm">Update your personal details</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              ) : (
                <div className="pl-10 pr-4 py-2 text-gray-900">{user?.full_name || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <div className="pl-10 pr-4 py-2 text-gray-900">{user?.email || 'Not set'}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <div className="pl-10 pr-4 py-2 text-gray-900">{user?.phone || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              {editing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="San Francisco, CA"
                />
              ) : (
                <div className="pl-10 pr-4 py-2 text-gray-900">{user?.location || 'Not set'}</div>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Settings</h2>
        <p className="text-gray-600 text-sm mb-4">Manage your account preferences</p>
        <p className="text-gray-500 text-sm mb-4">Additional account settings and preferences would appear here.</p>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Sign Out</h2>
        <p className="text-gray-600 text-sm mb-4">Sign out from your account</p>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
            navigate('/login');
          }}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

