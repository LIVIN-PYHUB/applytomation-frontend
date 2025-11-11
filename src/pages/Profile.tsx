import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import type { User } from '../types';
import { User as UserIcon, Mail, Phone, MapPin, LogOut, Settings, Edit2, Save, X, Crown, Sparkles, Zap, TrendingUp, CheckCircle2 } from 'lucide-react';
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
    <div className="w-full">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm">
            <UserIcon className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 mb-1">Profile</h1>
            <p className="text-gray-600 text-sm">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
              <UserIcon className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
              <p className="text-gray-600 text-sm mt-0.5">Update your personal details</p>
            </div>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              {editing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="John Doe"
                />
              ) : (
                <div className="pl-10 pr-4 py-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-200">{user?.full_name || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              <div className="pl-10 pr-4 py-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-200">{user?.email || 'Not set'}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              ) : (
                <div className="pl-10 pr-4 py-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-200">{user?.phone || 'Not set'}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-5 h-5" />
              {editing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  placeholder="San Francisco, CA"
                />
              ) : (
                <div className="pl-10 pr-4 py-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-200">{user?.location || 'Not set'}</div>
              )}
            </div>
          </div>

          {editing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  fetchProfile();
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
            <Settings className="w-6 h-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
            <p className="text-gray-600 text-sm mt-0.5">Manage your account preferences</p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Additional account settings and preferences would appear here.</p>
        </div>
      </div>

      {/* Premium Section */}
      <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-xl border-2 border-yellow-200 p-6 mb-6 shadow-lg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-200/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center border-2 border-yellow-300 shadow-md">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Premium Membership</h2>
              <p className="text-gray-600 text-sm mt-0.5">Unlock advanced features and exclusive benefits</p>
            </div>
          </div>

          {/* Coming Soon Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border-2 border-yellow-300 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-yellow-600 animate-pulse" />
            <span className="text-sm font-bold text-yellow-700">Coming Soon</span>
          </div>

          {/* Premium Features Preview */}
          <div className="bg-white/60 backdrop-blur-sm border border-yellow-200 rounded-xl p-5 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              Premium Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-yellow-200">
                  <CheckCircle2 className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Unlimited Applications</p>
                  <p className="text-xs text-gray-600">Apply to unlimited jobs without restrictions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-yellow-200">
                  <CheckCircle2 className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Priority Support</p>
                  <p className="text-xs text-gray-600">Get 24/7 priority customer support</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-yellow-200">
                  <CheckCircle2 className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">Advanced Analytics</p>
                  <p className="text-xs text-gray-600">Detailed insights and performance metrics</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-yellow-200">
                  <CheckCircle2 className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">AI-Powered Matching</p>
                  <p className="text-xs text-gray-600">Enhanced job matching with AI technology</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Development Progress</span>
              <span className="text-sm font-bold text-yellow-700">75%</span>
            </div>
            <div className="w-full bg-white/60 rounded-full h-2.5 border border-yellow-200">
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-blue-900">We're working hard!</span> Premium membership is currently in development. 
              Stay tuned for updates and be among the first to experience our premium features when they launch.
            </p>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center border border-red-200">
            <LogOut className="w-6 h-6 text-red-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Sign Out</h2>
            <p className="text-gray-600 text-sm mt-0.5">Sign out from your account</p>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
            navigate('/login');
          }}
          className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

