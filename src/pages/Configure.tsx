import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resumesApi, careerPortalsApi, mastersDataApi } from '../services/api';
import type { CareerPortal, Resume } from '../types';
import { X, Plus, Search, FileText, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';
import Industries from './Industries';
import Regions from './Regions';
import { showNotification } from '../components/NotificationCenter';
import Loading, { LoadingSpinner } from '../components/Loading';

export default function Configure() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedKeywords, setUploadedKeywords] = useState<string[] | null>(null);
  const [showKeywordsAlert, setShowKeywordsAlert] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadedResume, setUploadedResume] = useState<Resume | null>(null); // Only show after upload
  const [allResumes, setAllResumes] = useState<Resume[]>([]); // For duplicate checking only
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  
  // Career Portal Management
  const [careerPortals, setCareerPortals] = useState<CareerPortal[]>([]);
  const [newPortalUrl, setNewPortalUrl] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [industries, setIndustries] = useState<any[]>([]);
  const [addingPortal, setAddingPortal] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'industries' | 'regions'>('settings');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCareerPortals();
    fetchIndustries();
    fetchAllResumesForDuplicateCheck();
  }, []);

  // Only fetch resumes for duplicate checking, don't display them
  const fetchAllResumesForDuplicateCheck = async () => {
    try {
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const response = await resumesApi.getAll({ user_id: userId });
      const resumes = response.data || [];
      // Store all resumes for duplicate checking only
      setAllResumes(resumes);
    } catch (error) {
      console.error('Error fetching resumes for duplicate check:', error);
      setAllResumes([]);
    }
  };

  const fetchIndustries = async () => {
    try {
      const response = await mastersDataApi.getIndustries();
      setIndustries(response.data);
    } catch (error) {
      console.error('Error fetching industries:', error);
    }
  };

  const fetchCareerPortals = async () => {
    try {
      const response = await careerPortalsApi.getAll();
      setCareerPortals(response.data);
    } catch (error) {
      console.error('Error fetching career portals:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOCX, DOC, or TXT file');
        setDuplicateWarning(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setDuplicateWarning(null);
        return;
      }

      // Check for duplicate filename (check against all resumes)
      const duplicateResume = allResumes.find(r => r.filename === file.name);
      if (duplicateResume) {
        setDuplicateWarning(`⚠️ Resume with filename "${file.name}" already exists. Please delete the existing resume first or upload with a different name.`);
        setError(null);
      } else {
        setDuplicateWarning(null);
        setError(null);
      }

      setResumeFile(file);
    }
  };

  const handleUploadResume = async () => {
    if (!resumeFile) {
      setToast({ message: 'Please select a file to upload', type: 'error' });
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const response = await resumesApi.upload(resumeFile, userId);
      
      if (response.data.keywords) {
        try {
          const keywords = JSON.parse(response.data.keywords);
          setUploadedKeywords(keywords);
          setShowKeywordsAlert(true);
          setTimeout(() => setShowKeywordsAlert(false), 15000);
        } catch (e) {
          console.error('Error parsing keywords:', e);
        }
      }
      
      setResumeFile(null);
      setDuplicateWarning(null);
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setSuccess('Resume uploaded successfully!');
      setToast({ message: '✅ Resume uploaded successfully!', type: 'success' });
      showNotification('success', 'Resume uploaded successfully! Keywords extracted.');
      // Show the uploaded resume so user can delete if wrong
      setUploadedResume(response.data);
      // Refresh resumes list for duplicate checking
      await fetchAllResumesForDuplicateCheck();
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to upload resume';
      setError(errorMsg);
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
      // Check if it's a duplicate error
      if (errorMsg.includes('already exists')) {
        setDuplicateWarning(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async (resumeId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await resumesApi.delete(resumeId);
      setToast({ message: '✅ Resume deleted successfully!', type: 'success' });
      showNotification('success', 'Resume deleted successfully!');
      // Clear the uploaded resume display
      setUploadedResume(null);
      // Refresh resumes list for duplicate checking
      await fetchAllResumesForDuplicateCheck();
      // Clear file input if the deleted resume was selected
      if (resumeFile && resumeFile.name === filename) {
        setResumeFile(null);
        setDuplicateWarning(null);
        const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete resume';
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
    }
  };

  const handleAddCareerPortal = async () => {
    if (!newPortalUrl.trim()) {
      setToast({ message: 'Please enter a career portal URL', type: 'error' });
      return;
    }

    try {
      setAddingPortal(true);
      setError(null);
      setSuccess(null);
      
      await careerPortalsApi.create({
        name: newPortalUrl,
        url: newPortalUrl,
        tier: selectedTier || 1,
      });
      
      setNewPortalUrl('');
      setSelectedTier(null);
      await fetchCareerPortals();
      setToast({ message: '✅ Career portal added successfully!', type: 'success' });
      setSuccess('Career portal added successfully!');
      showNotification('success', 'Career portal added successfully!');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to add career portal';
      setError(errorMsg);
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
    } finally {
      setAddingPortal(false);
    }
  };

  const handleRemoveCareerPortal = async (id: number) => {
    if (!confirm('Are you sure you want to remove this career portal?')) return;
    
    try {
      await careerPortalsApi.delete(id);
      await fetchCareerPortals();
      setToast({ message: '✅ Career portal removed successfully!', type: 'success' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Failed to remove career portal';
      setError(errorMsg);
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      // Save any pending settings here
      setToast({ message: '✅ Settings saved successfully!', type: 'success' });
      setSaving(false);
      navigate('/home');
    } catch (error: any) {
      setToast({ message: `❌ Failed to save settings: ${error.response?.data?.detail || 'Unknown error'}`, type: 'error' });
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const filteredPortals = careerPortals.filter(portal => {
    if (!searchCompany.trim()) return true;
    const searchLower = searchCompany.toLowerCase();
    return (
      portal.company_name?.toLowerCase().includes(searchLower) ||
      portal.name?.toLowerCase().includes(searchLower) ||
      portal.url?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Configure Application Settings</h1>
      <p className="text-gray-600 mb-8">Customize your job application preferences and automation settings.</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'settings'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('industries')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'industries'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Industries
        </button>
        <button
          onClick={() => setActiveTab('regions')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'regions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Regions & Locations
        </button>
      </div>

      {activeTab === 'industries' && <Industries />}
      {activeTab === 'regions' && <Regions />}
      {activeTab === 'settings' && (
        <>

      {/* Resume Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Resume Upload</h2>
        <p className="text-gray-600 mb-4">Upload your resume for automated applications</p>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {duplicateWarning && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">{duplicateWarning}</p>
          </div>
        )}

        {/* Show uploaded resume only after upload (not on page load) */}
        {uploadedResume && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{uploadedResume.filename}</p>
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(uploadedResume.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteResume(uploadedResume.id, uploadedResume.filename)}
                className="ml-3 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete this resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">If this file is wrong, you can delete it above.</p>
          </div>
        )}

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4 hover:border-blue-400 transition-colors">
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-2">
              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">PDF, DOC, DOCX, TXT (max. 5MB)</p>
          </label>
        </div>

        {/* Show selected file before upload */}
        {resumeFile && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">{resumeFile.name}</span>
              </div>
              <button 
                onClick={() => {
                  setResumeFile(null);
                  setDuplicateWarning(null);
                  const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                }} 
                className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {resumeFile && (
          <button
            onClick={handleUploadResume}
            disabled={!resumeFile || uploading || !!duplicateWarning}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Uploading...</span>
              </>
            ) : (
              'Upload Resume'
            )}
          </button>
        )}
      </div>

      {/* Keywords Alert */}
      {showKeywordsAlert && uploadedKeywords && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-blue-900">Extracted Keywords from Resume:</h3>
            <button onClick={() => setShowKeywordsAlert(false)} className="text-blue-600 hover:text-blue-800 font-bold text-xl">×</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {uploadedKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Company Tier Preference */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Company Tier Preference</h2>
        <p className="text-gray-600 mb-4">Choose company tiers based on size and market position</p>
        <div className="space-y-3">
          {[1, 2, 3].map((tier) => (
            <label key={tier} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tier"
                value={tier}
                checked={selectedTier === tier}
                onChange={() => setSelectedTier(tier)}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-900">Tier {tier}</span>
              <span className="text-gray-400">ℹ️</span>
            </label>
          ))}
        </div>
      </div>

      {/* Career Sites */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Career Sites</h2>
        <p className="text-gray-600 mb-4">Add specific company career portals to target</p>

        {/* Existing Portals */}
        {filteredPortals.length > 0 && (
          <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
            {filteredPortals.map((portal) => (
              <div key={portal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 truncate">{portal.company_name || portal.name || portal.url}</span>
                    {portal.tier && (
                      <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                        portal.tier === 1 ? 'bg-blue-100 text-blue-800' :
                        portal.tier === 2 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Tier {portal.tier}
                      </span>
                    )}
                  </div>
                  {portal.url && portal.url !== (portal.company_name || portal.name) && (
                    <p className="text-xs text-gray-500 truncate mt-1">{portal.url}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCareerPortal(portal.id)}
                  className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
                  title="Remove portal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Portal */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPortalUrl}
            onChange={(e) => setNewPortalUrl(e.target.value)}
            placeholder="Enter career portal URL (e.g., careers.company.com)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddCareerPortal}
            disabled={addingPortal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {addingPortal ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {/* Search by Company Name */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchCompany}
            onChange={(e) => setSearchCompany(e.target.value)}
            placeholder="Search by Company Name"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Career Portals Scroller */}
      {careerPortals.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Career Portals</h2>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ minWidth: 'max-content' }}>
              {careerPortals.map((portal) => (
                <div key={portal.id} className="flex-shrink-0 w-64 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">{portal.company_name || portal.name || 'Unnamed Portal'}</h3>
                    {portal.tier && (
                      <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                        portal.tier === 1 ? 'bg-blue-100 text-blue-800' :
                        portal.tier === 2 ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Tier {portal.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate" title={portal.url}>{portal.url}</p>
                  {portal.industry && <p className="text-xs text-gray-500 truncate">{portal.industry}</p>}
                  {portal.city && portal.country && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{portal.city}, {portal.country}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Settings'
          )}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
        </>
      )}
    </div>
  );
}
