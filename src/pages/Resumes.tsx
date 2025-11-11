import { useState, useEffect } from 'react';
import { resumesApi, jobMatchesApi } from '../services/api';
import type { Resume } from '../types';
import { FileText, Calendar, X, Download, Search, Send, Loader2, Upload, CheckCircle2, FileUp } from 'lucide-react';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showKeywords, setShowKeywords] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [applyingResumeId, setApplyingResumeId] = useState<number | null>(null);
  const [applyResults, setApplyResults] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const response = await resumesApi.getAll({ user_id: userId });
      setResumes(response.data || []);
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      const errorMsg = error.response?.data?.detail || 'Failed to load resumes';
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
      setResumes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumesApi.delete(id);
      setResumes(resumes.filter(r => r.id !== id));
      setToast({ message: '✅ Resume deleted successfully!', type: 'success' });
    } catch (error: any) {
      setToast({ message: `❌ ${error.response?.data?.detail || 'Failed to delete resume'}`, type: 'error' });
    }
  };

  const parseKeywords = (keywords: string | null): string[] => {
    if (!keywords) return [];
    try {
      return JSON.parse(keywords);
    } catch {
      return [];
    }
  };

  const handleFindAndApply = async (resume: Resume) => {
    if (!resume.keywords) {
      setToast({ message: '❌ Resume has no keywords. Please re-upload the resume.', type: 'error' });
      return;
    }

    if (!confirm(`Find and apply to jobs matching your resume?\n\nThis will:\n- Search for relevant jobs\n- Apply to top matches\n- Send emails with your resume\n\nContinue?`)) {
      return;
    }

    try {
      setApplyingResumeId(resume.id);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      
      const response = await jobMatchesApi.autoApply(userId, {
        resume_id: resume.id,
        min_match_score: 50,
        max_applications: 10,
        auto_send_email: true
      });

      const result = response.data;
      setApplyResults({ ...applyResults, [resume.id]: result });

      if (result.success) {
        const successMsg = `✅ Successfully applied to ${result.applications_sent} job(s)!\n\nFound ${result.matches_found} matches, applied to ${result.applications_created} positions.`;
        setToast({ message: successMsg, type: 'success' });
        
        // Refresh notifications to show new application notifications
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('refresh-notifications'));
          // Refresh history page if user navigates there
          window.dispatchEvent(new CustomEvent('refresh-applications'));
        }, 1000);
      } else {
        setToast({ message: `⚠️ ${result.message || 'Auto-apply completed with warnings'}`, type: 'error' });
      }
    } catch (error: any) {
      console.error('Error auto-applying:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to find and apply to jobs';
      setToast({ message: `❌ ${errorMsg}`, type: 'error' });
    } finally {
      setApplyingResumeId(null);
    }
  };

  return (
    <div className="w-full">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Uploaded Resumes</h1>
            <p className="text-gray-600 text-sm mt-1">View all your uploaded resumes and extracted keywords</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 shadow-sm">
          <Loading message="Loading resumes..." />
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileUp className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
          <p className="text-gray-600 mb-6">Upload a resume from the Configure page to get started.</p>
          <button
            onClick={() => window.location.href = '/configure'}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
          >
            <Upload className="w-4 h-4" />
            Go to Configure
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {resumes.map((resume) => {
            const keywords = parseKeywords(resume.keywords);
            return (
              <div key={resume.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{resume.filename}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Uploaded: {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        {keywords.length > 0 && (
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200">
                            {keywords.length} keywords extracted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <button
                      onClick={() => handleFindAndApply(resume)}
                      disabled={applyingResumeId === resume.id || !resume.keywords}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md text-sm"
                      title={!resume.keywords ? 'No keywords found. Please re-upload resume.' : 'Find and apply to matching jobs'}
                    >
                      {applyingResumeId === resume.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Find & Apply Jobs</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete resume"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Application Results */}
                {applyResults[resume.id] && (
                  <div className="mt-5 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Application Results
                        </h4>
                        <div className="space-y-1.5 text-sm text-green-800">
                          <p>
                            ✅ Successfully applied to <strong className="text-green-900">{applyResults[resume.id].applications_sent}</strong> job(s)
                          </p>
                          <p className="text-xs text-green-700">
                            Found {applyResults[resume.id].matches_found} matches, 
                            created {applyResults[resume.id].applications_created} applications
                          </p>
                        </div>
                        {applyResults[resume.id].email_results && applyResults[resume.id].email_results.length > 0 && (
                          <details className="mt-3 pt-3 border-t border-green-200">
                            <summary className="text-xs font-medium text-green-700 cursor-pointer hover:text-green-900">
                              View email details ({applyResults[resume.id].email_results.length})
                            </summary>
                            <div className="mt-2 space-y-1.5">
                              {applyResults[resume.id].email_results.slice(0, 5).map((email: any, idx: number) => (
                                <div key={idx} className="text-xs text-green-700 pl-3 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                  <span>{email.company_name}: {email.status === 'sent' ? '✅ Sent' : email.reason || 'Skipped'}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Keywords Section */}
                {keywords.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <button
                      onClick={() => setShowKeywords(showKeywords === resume.id ? null : resume.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-2 transition-colors"
                    >
                      {showKeywords === resume.id ? (
                        <>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Hide Keywords ({keywords.length})
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          Show Keywords ({keywords.length})
                        </>
                      )}
                    </button>
                    {showKeywords === resume.id && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1.5 bg-white text-blue-700 rounded-full text-sm font-medium border border-blue-200 shadow-sm"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Text Preview */}
                {resume.raw_text && (
                  <div className="mt-5 pt-5 border-t border-gray-200">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2 hover:text-gray-900 transition-colors">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        View Raw Text ({resume.raw_text.length.toLocaleString()} characters)
                      </summary>
                      <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                          {resume.raw_text.substring(0, 1000)}
                          {resume.raw_text.length > 1000 && '...'}
                        </pre>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

