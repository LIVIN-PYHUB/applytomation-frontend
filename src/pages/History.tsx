import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsApi } from '../services/api';
import type { Application } from '../types';
import { Plus, TrendingUp, Edit, Bell, X, Calendar, Briefcase, Clock, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/EnhancedToast';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function History() {
  const navigate = useNavigate();
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
  const { toasts, removeToast, success, error } = useToast();

  const checkReminders = () => {
    try {
      const reminders = JSON.parse(localStorage.getItem('applicationReminders') || '[]');
      const now = new Date().getTime();
      
      reminders.forEach((reminder: any) => {
        const reminderTime = new Date(reminder.dateTime).getTime();
        const timeUntilReminder = reminderTime - now;
        
        // Show notification if reminder is due (within 1 minute)
        if (timeUntilReminder > 0 && timeUntilReminder <= 60000) {
          showReminderNotification(reminder);
        }
        
        // Remove past reminders (older than 1 hour)
        if (timeUntilReminder < -3600000) {
          const updatedReminders = reminders.filter((r: any) => r.id !== reminder.id);
          localStorage.setItem('applicationReminders', JSON.stringify(updatedReminders));
        }
      });
    } catch (err) {
      console.error('Error checking reminders:', err);
    }
  };

  const showReminderNotification = (reminder: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Application Follow-up Reminder', {
        body: `Follow up on ${reminder.jobTitle} at ${reminder.companyName}`,
        icon: '/favicon.ico',
        tag: `reminder-${reminder.id}`,
        requireInteraction: true
      });
      
      // Show toast notification as well
      success(`Reminder: Follow up on ${reminder.jobTitle} at ${reminder.companyName}`);
    }
  };

  useEffect(() => {
    fetchApplications();
    
    // Listen for refresh events from other pages (e.g., after auto-apply)
    const handleRefresh = () => {
      fetchApplications();
    };
    window.addEventListener('refresh-applications', handleRefresh);
    
    // Check for reminders on page load
    checkReminders();
    
    // Check for reminders every minute
    const reminderInterval = setInterval(checkReminders, 60000);
    
    return () => {
      window.removeEventListener('refresh-applications', handleRefresh);
      clearInterval(reminderInterval);
    };
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
      success('Application updated successfully!');
      setShowEditModal(false);
      setEditingApp(null);
      fetchApplications();
    } catch (error: any) {
      error(error.response?.data?.detail || 'Failed to update application');
    }
  };

  const handleFollowUp = (app: Application) => {
    setFollowUpApp(app);
    setShowFollowUpModal(true);
  };

  const handleSetReminder = async () => {
    if (!followUpApp || !reminderDate || !reminderTime) {
      error('Please select both date and time');
      return;
    }

    try {
      // Validate date is not in the past
      const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
      const now = new Date();
      
      if (reminderDateTime <= now) {
        error('Please select a future date and time');
        return;
      }

      // Request notification permission if not already granted
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Save reminder to backend (in notes)
      const reminderNote = `[Reminder set for ${reminderDateTime.toLocaleString()}]`;
      await applicationsApi.update(followUpApp.id, {
        ...followUpApp,
        notes: `${followUpApp.notes || ''}\n${reminderNote}`.trim()
      });
      
      // Store reminder in localStorage for persistence
      const reminderId = `reminder-${followUpApp.id}-${Date.now()}`;
      const reminders = JSON.parse(localStorage.getItem('applicationReminders') || '[]');
      reminders.push({
        id: reminderId,
        applicationId: followUpApp.id,
        jobTitle: followUpApp.job_title,
        companyName: followUpApp.company_name,
        dateTime: reminderDateTime.toISOString(),
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('applicationReminders', JSON.stringify(reminders));

      // Schedule immediate notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const timeUntilReminder = reminderDateTime.getTime() - Date.now();
        if (timeUntilReminder > 0 && timeUntilReminder <= 86400000) { // Only for reminders within 24 hours
          setTimeout(() => {
            showReminderNotification({
              id: reminderId,
              jobTitle: followUpApp.job_title,
              companyName: followUpApp.company_name
            });
          }, timeUntilReminder);
        }
      }

      success(`Reminder set for ${reminderDateTime.toLocaleString()}!`);
      setShowFollowUpModal(false);
      setFollowUpApp(null);
      setReminderDate('');
      setReminderTime('');
      fetchApplications();
    } catch (error: any) {
      console.error('Error setting reminder:', error);
      error(error.response?.data?.detail || 'Failed to set reminder');
    }
  };

  const tabs = ['All', 'Applied', 'Interviews', 'Feedback', 'Pending'];

  return (
    <div>
      <ToastContainer toasts={toasts || []} onClose={removeToast} />

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Application"
        size="md"
      >
        {editingApp && (
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingApp.job_title}
                  onChange={(e) => setEditingApp({ ...editingApp, job_title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={editingApp.company_name}
                  onChange={(e) => setEditingApp({ ...editingApp, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
        )}
      </Modal>

      {/* Follow-up Reminder Modal */}
      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="Set Follow-up Reminder"
        size="md"
      >
        {followUpApp && (
          <div className="p-6">
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
                onClick={() => {
                  setShowFollowUpModal(false);
                  setReminderDate('');
                  setReminderTime('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200 shadow-sm">
              <Clock className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Application History</h1>
              <p className="text-gray-600 text-sm">Track and manage all your job applications</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchInsights}
              className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 flex items-center gap-2 font-semibold transition-all shadow-sm hover:shadow-md"
            >
              <TrendingUp className="w-4 h-4" />
              Insights
            </button>
            <button
              onClick={() => navigate('/coming-soon?feature=New Application')}
              className="px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 flex items-center gap-2 font-semibold transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Application
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl inline-flex border border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
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

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
              <Briefcase className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Application List</h2>
              <p className="text-sm text-gray-600 mt-0.5">View and manage all your job applications</p>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="p-16">
            <Loading message="Loading application history..." />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-200">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-700 font-semibold text-lg mb-1">No applications found</p>
            <p className="text-sm text-gray-500 mb-6">Create a new application to get started</p>
            <button
              onClick={() => navigate('/coming-soon?feature=New Application')}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              New Application
            </button>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section - Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200 shadow-sm">
                        <Briefcase className="w-7 h-7 text-blue-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-900 leading-tight">{app.job_title}</h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(app.status)} flex-shrink-0`}>
                              {app.status}
                            </span>
                            {app.status === 'Applied' && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700 flex-shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Confirmed</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm">{app.company_name}</span>
                            {app.career_portal_id && (
                              <span className="text-gray-500 text-xs">• Portal #{app.career_portal_id}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <Clock className="w-3.5 h-3.5 text-gray-500" />
                            {app.application_date ? (
                              <>
                                <span className="font-medium">{new Date(app.application_date).toLocaleDateString()}</span>
                                <span className="text-gray-400">•</span>
                                <span>{new Date(app.application_date).toLocaleTimeString()}</span>
                              </>
                            ) : (
                              <span>Date not available</span>
                            )}
                          </div>
                          <div className="px-2.5 py-1 bg-gray-50 rounded-lg border border-gray-200">
                            <span className="font-medium">ID: #{app.id}</span>
                          </div>
                        </div>
                        
                        {app.notes && app.notes.includes('Match score') && (
                          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-700">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            {app.notes.split('|')[0]}
                          </div>
                        )}
                        
                        {app.notes && app.notes.includes('Reminder set for') && (
                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg text-xs font-medium text-purple-700">
                            <Bell className="w-3.5 h-3.5" />
                            {app.notes.split('Reminder set for')[1]?.split(']')[0] && (
                              <span>Reminder: {app.notes.split('Reminder set for')[1].split(']')[0]}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div className="flex items-start gap-2 flex-shrink-0 pt-1">
                    <button
                      onClick={() => handleEdit(app)}
                      className="p-2.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                      title="Edit application"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleFollowUp(app)}
                      className="p-2.5 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all border border-transparent hover:border-gray-200"
                      title="Set follow-up reminder"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

