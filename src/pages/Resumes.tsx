import { useState, useEffect } from 'react';
import { resumesApi } from '../services/api';
import type { Resume } from '../types';
import { FileText, Calendar, X, Download } from 'lucide-react';
import Toast from '../components/Toast';
import Loading from '../components/Loading';

export default function Resumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showKeywords, setShowKeywords] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  return (
    <div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uploaded Resumes</h1>
          <p className="text-gray-600">View all your uploaded resumes and extracted keywords</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <Loading message="Loading resumes..." />
        </div>
      ) : resumes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes uploaded yet</h3>
          <p className="text-gray-600 mb-6">Upload a resume from the Configure page to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => {
            const keywords = parseKeywords(resume.keywords);
            return (
              <div key={resume.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{resume.filename}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete resume"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Keywords Section */}
                {keywords.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowKeywords(showKeywords === resume.id ? null : resume.id)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 mb-2"
                    >
                      {showKeywords === resume.id ? 'Hide' : 'Show'} Keywords ({keywords.length})
                    </button>
                    {showKeywords === resume.id && (
                      <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
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
                  <div className="mt-4">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700 mb-2">
                        View Raw Text ({resume.raw_text.length} characters)
                      </summary>
                      <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
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

