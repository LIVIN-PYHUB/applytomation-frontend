import { useState, useEffect } from 'react';
import { applicationsApi } from '../services/api';
import type { Application } from '../types';
import { Plus, TrendingUp, Edit, Bell, X, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

export default function History() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpApp, setFollowUpApp] = useState<Application | null>(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const params: any = { user_id: userId };
      if (activeTab !== 'All') {
        params.status = activeTab;
      }
      const response = await applicationsApi.getAll(params);
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const userId = 1; // TODO: Get from auth context
      const response = await applicationsApi.getInsights(userId);
      setInsights(response.data);
      setShowInsights(true);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Applied': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Reviewing': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Interview': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Feedback': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Pending': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'Accepted': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleEdit = (app: Application) => {
    setEditingApp(app);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingApp) return;
    
    try {
      await applicationsApi.update(editingApp.id, editingApp);
      setToast({ message: '✅ Application updated successfully!', type: 'success' });
      setShowEditModal(false);
      setEditingApp(null);
      fetchApplications();
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to update application'}`, type: 'error' });
    }
  };

  const handleFollowUp = (app: Application) => {
    setFollowUpApp(app);
    setShowFollowUpModal(true);
  };

  const handleSetReminder = async () => {
    if (!followUpApp || !reminderDate || !reminderTime) {
      setToast({ message: 'Please select both date and time', type: 'error' });
      return;
    }

    try {
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      await applicationsApi.update(followUpApp.id, {
        ...followUpApp,
        notes: `${followUpApp.notes || ''}\n[Reminder set for ${reminderDateTime.toLocaleString()}]`.trim()
      });
      
      // Schedule browser notification (if permission granted)
      if ('Notification' in window && Notification.permission === 'granted') {
        const timeUntilReminder = reminderDateTime.getTime() - Date.now();
        if (timeUntilReminder > 0) {
          setTimeout(() => {
            new Notification('Application Follow-up Reminder', {
              body: `Follow up on ${followUpApp.job_title} at ${followUpApp.company_name}`,
              icon: '/favicon.ico'
            });
          }, timeUntilReminder);
        }
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            const timeUntilReminder = reminderDateTime.getTime() - Date.now();
            if (timeUntilReminder > 0) {
              setTimeout(() => {
                new Notification('Application Follow-up Reminder', {
                  body: `Follow up on ${followUpApp.job_title} at ${followUpApp.company_name}`,
                  icon: '/favicon.ico'
                });
              }, timeUntilReminder);
            }
          }
        });
      }

      setToast({ message: '✅ Reminder set successfully!', type: 'success' });
      setShowFollowUpModal(false);
      setFollowUpApp(null);
      setReminderDate('');
      setReminderTime('');
      fetchApplications();
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to set reminder'}`, type: 'error' });
    }
  };

  const tabs = ['All', 'Interviews', 'Feedback', 'Pending'];

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Application</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingApp.job_title}
                  onChange={(e) => setEditingApp({ ...editingApp, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editingApp.company_name}
                  onChange={(e) => setEditingApp({ ...editingApp, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingApp.status}
                  onChange={(e) => setEditingApp({ ...editingApp, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Interview">Interview</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingApp.notes || ''}
                  onChange={(e) => setEditingApp({ ...editingApp, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Reminder Modal */}
      {showFollowUpModal && followUpApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Set Follow-up Reminder</h2>
              <button onClick={() => setShowFollowUpModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>{followUpApp.job_title}</strong> at <strong>{followUpApp.company_name}</strong>
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Date</label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Time</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSetReminder}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                Set Reminder
              </button>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Application History</h1>
          <p className="text-gray-600">Track and manage all your job applications</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {/* Open new application modal */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Application
          </button>
          <button
            onClick={fetchInsights}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Insights
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Insights Modal */}
      {showInsights && insights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Insights & Summary</h2>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mb-6">Overview of your application performance</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">{insights.total_applications}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Interview Rate</p>
                <p className="text-2xl font-bold text-green-600">{insights.interview_rate}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Active Interviews</p>
                <p className="text-2xl font-bold text-purple-600">{insights.active_interviews}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Avg Interview Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {insights.avg_interview_rating ? `${insights.avg_interview_rating}/5` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Status Breakdown Pie Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(insights.status_breakdown).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.keys(insights.status_breakdown).map((entry, index) => {
                        const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82CA9D'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Companies Bar Chart */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Top Companies</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={insights.top_companies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Top Companies</h3>
              <div className="flex flex-wrap gap-2">
                {insights.top_companies.map((company: any, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {company.name} ({company.count})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                {insights.recommendations.map((rec: string, index: number) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowInsights(false)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

              {/* Applications Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Application List</h2>
                  <p className="text-sm text-gray-600 mt-1">View and manage all your job applications</p>
                </div>
                {loading ? (
                  <div className="bg-white rounded-lg shadow-md p-8">
                    <Loading message="Loading application history..." />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No applications found.</p>
                    <p className="text-sm">Create a new application to get started.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{app.job_title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.company_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(app.application_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit application"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFollowUp(app)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Set follow-up reminder"
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
          );
        }

