import { useState, useEffect } from 'react';
import { applicationsApi, careerPortalsApi, jobsApi, jobMatchesApi, resumesApi } from '../services/api';
import type { Application, CareerPortal } from '../types';
import { ExternalLink, MapPin, DollarSign, Calendar, TrendingUp, Briefcase, CheckCircle2 } from 'lucide-react';
import Loading from '../components/Loading';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/EnhancedToast';
import ConfirmationModal from '../components/ConfirmationModal';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  description?: string;
  url: string;
  posted_date?: string;
}

interface JobRecommendation {
  career_portal: CareerPortal;
  match_score: number;
  matched_keywords: string[];
  reason: string;
}

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobRecommendations, setJobRecommendations] = useState<JobRecommendation[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [autoApplying, setAutoApplying] = useState(false);
  const [autoAppliedCount, setAutoAppliedCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<{ portal: CareerPortal; recommendation: JobRecommendation } | null>(null);
  const { toasts, removeToast, success, error, info } = useToast();
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    salary: '',
  });

  useEffect(() => {
    fetchApplications();
    fetchJobRecommendations();
    
    // Listen for refresh events from other pages (e.g., after auto-apply)
    const handleRefresh = () => {
      fetchApplications();
      fetchJobRecommendations();
    };
    window.addEventListener('refresh-applications', handleRefresh);
    
    return () => {
      window.removeEventListener('refresh-applications', handleRefresh);
    };
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Get current user ID from token or context
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const response = await applicationsApi.getAll({ user_id: userId });
      setApplications(response.data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchJobRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const userId = parseInt(localStorage.getItem('userId') || '1');
      
      // Get latest resume
      const resumesResponse = await resumesApi.getAll({ user_id: userId });
      const resumes = resumesResponse.data || [];
      
      if (resumes.length === 0) {
        setJobRecommendations([]);
        return;
      }
      
      // Get recommendations for the latest resume
      const latestResume = resumes[0];
      const response = await jobMatchesApi.getRecommendations(userId, latestResume.id, 20);
      const recommendations = response.data || [];
      setJobRecommendations(recommendations);
      
      // Fetch current applications first to check duplicates
      await fetchApplications();
      
      // Auto-apply to jobs with match score > 10%
      await autoApplyToHighMatchJobs(recommendations, userId, latestResume.id);
    } catch (error) {
      console.error('Error fetching job recommendations:', error);
      setJobRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const autoApplyToHighMatchJobs = async (recommendations: JobRecommendation[], userId: number, resumeId: number) => {
    try {
      setAutoApplying(true);
      
      // Get current applications to check what's already applied
      const appsResponse = await applicationsApi.getAll({ user_id: userId });
      const currentApps = appsResponse.data || [];
      
      console.log('📊 Current applications:', currentApps.length);
      console.log('📊 Recommendations:', recommendations.length);
      
      // Filter jobs with match score > 10% that haven't been applied to yet
      const highMatchJobs = recommendations.filter(rec => {
        const isApplied = currentApps.some(app => app.career_portal_id === rec.career_portal.id);
        const shouldApply = rec.match_score > 10 && !isApplied;
        
        if (rec.match_score > 10) {
          console.log(`🔍 ${rec.career_portal.company_name || rec.career_portal.name}: ${rec.match_score}% match, Applied: ${isApplied}, Will Apply: ${shouldApply}`);
        }
        
        return shouldApply;
      });

      console.log(`🎯 High match jobs (>10%): ${highMatchJobs.length}`);

      if (highMatchJobs.length === 0) {
        console.log('ℹ️ No jobs to auto-apply (all already applied or below threshold)');
        setAutoApplying(false);
        return; // No jobs to auto-apply
      }

      console.log(`🚀 Auto-applying to ${highMatchJobs.length} jobs with match score > 10%`);
      console.log('📋 Jobs to auto-apply:', highMatchJobs.map(j => ({
        company: j.career_portal.company_name || j.career_portal.name,
        matchScore: j.match_score,
        keywords: j.matched_keywords
      })));

      // Apply to each job
      const applyPromises = highMatchJobs.map(async (recommendation) => {
        const companyName = recommendation.career_portal.company_name || recommendation.career_portal.name;
        try {
          console.log(`📤 Applying to ${companyName} (${recommendation.match_score}% match)...`);
          
          const result = await jobMatchesApi.applyToJob(userId, {
            career_portal_id: recommendation.career_portal.id,
            resume_id: resumeId,
            job_title: `Position at ${companyName}`,
            notes: `Auto-applied: Match score ${recommendation.match_score}% | Matched keywords: ${recommendation.matched_keywords.join(', ')}`
          });
          
          console.log(`✅ Successfully applied to ${companyName}`);
          console.log('📦 Application response:', result.data);
          
          // Handle different response structures
          const applicationId = result.data?.application?.id || result.data?.application_id || null;
          
          return { 
            success: true, 
            portalId: recommendation.career_portal.id,
            companyName: companyName,
            matchScore: recommendation.match_score,
            applicationId: applicationId,
            applicationData: result.data
          };
        } catch (error) {
          console.error(`❌ Error auto-applying to ${companyName}:`, error);
          return { 
            success: false, 
            portalId: recommendation.career_portal.id,
            companyName: companyName,
            error: error
          };
        }
      });

      const results = await Promise.all(applyPromises);
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      setAutoAppliedCount(successCount);

      if (successCount > 0) {
        console.log(`✅ Successfully auto-applied to ${successCount} job(s)`);
        console.log('📊 Application Summary:', {
          total: highMatchJobs.length,
          successful: successCount,
          failed: failedCount,
          applications: results.filter(r => r.success).map(r => ({
            company: r.companyName,
            matchScore: r.matchScore,
            applicationId: r.applicationId
          }))
        });
        
        // Show success toast
        success(
          `Successfully auto-applied to ${successCount} job${successCount !== 1 ? 's' : ''}!`,
          5000,
          {
            label: 'View in History',
            onClick: () => window.location.href = '/history'
          }
        );
        console.log('💾 All applications saved to database and visible in History > Applied tab');
        
        // Refresh applications and recommendations after a short delay
        setTimeout(async () => {
          console.log('🔄 Refreshing applications and recommendations...');
          await fetchApplications();
          // Wait a bit more for applications to be saved
          setTimeout(() => {
            fetchJobRecommendations();
            window.dispatchEvent(new CustomEvent('refresh-applications'));
            window.dispatchEvent(new CustomEvent('refresh-notifications'));
          }, 500);
        }, 1500);
      } else if (failedCount > 0) {
        error(`Failed to apply to ${failedCount} job${failedCount !== 1 ? 's' : ''}`);
        console.error(`❌ Failed to apply to ${failedCount} job(s)`);
      }
    } catch (error: any) {
      error('Error during auto-apply process. Please try again.');
      console.error('Error in auto-apply process:', error);
    } finally {
      setAutoApplying(false);
    }
  };

  const handleConfirmApplication = async () => {
    if (!pendingApplication) return;

    try {
      const userId = parseInt(localStorage.getItem('userId') || '1');
      const resumesResponse = await resumesApi.getAll({ user_id: userId });
      const latestResume = resumesResponse.data?.[0];

      if (!latestResume) {
        error('Please upload a resume first');
        setShowConfirmModal(false);
        return;
      }

      const { portal, recommendation } = pendingApplication;
      
      const result = await jobMatchesApi.applyToJob(userId, {
        career_portal_id: portal.id,
        resume_id: latestResume.id,
        job_title: `Position at ${portal.company_name || portal.name}`,
        notes: `Match score: ${recommendation.match_score}% | Matched keywords: ${recommendation.matched_keywords.join(', ')}`
      });

      const applicationId = result.data?.application?.id || 'N/A';
      
      success(
        `Successfully applied to ${portal.company_name || portal.name}! Application ID: ${applicationId}`,
        5000,
        {
          label: 'View in History',
          onClick: () => window.location.href = '/history'
        }
      );

      // Refresh applications and recommendations
      await fetchApplications();
      fetchJobRecommendations();
      window.dispatchEvent(new CustomEvent('refresh-applications'));
      window.dispatchEvent(new CustomEvent('refresh-notifications'));

      setShowConfirmModal(false);
      setPendingApplication(null);
    } catch (err: any) {
      console.error('Error applying to job:', err);
      error(err.response?.data?.detail || err.message || 'Failed to apply to job');
      setShowConfirmModal(false);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      setShowJobs(true);
      const response = await jobsApi.search({
        keywords: filters.industry || 'software',
        location: filters.location || '',
        country: 'us',
        page: 1,
      });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer toasts={toasts || []} onClose={removeToast} />
      
      {showConfirmModal && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setPendingApplication(null);
          }}
          onConfirm={handleConfirmApplication}
          title="Confirm Application"
          message={
            pendingApplication
              ? `Are you sure you want to apply to ${pendingApplication.portal.company_name || pendingApplication.portal.name}?\n\nMatch Score: ${pendingApplication.recommendation.match_score}%\nMatched Keywords: ${pendingApplication.recommendation.matched_keywords.join(', ')}`
              : ''
          }
          type="info"
          confirmText="Apply Now"
          cancelText="Cancel"
        />
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Jobs for You</h1>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-gray-600">
                Based on your resume keywords • {loadingRecommendations ? 'Loading...' : `${jobRecommendations.length} jobs found`}
              </p>
              {autoAppliedCount > 0 && (
                <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded text-xs font-medium border border-green-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Auto-applied to {autoAppliedCount} job{autoAppliedCount !== 1 ? 's' : ''}
                </span>
              )}
              {autoApplying && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-200 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                  Auto-applying...
                </span>
              )}
            </div>
          </div>
          <button
            onClick={async () => {
              const userId = parseInt(localStorage.getItem('userId') || '1');
              const resumesResponse = await resumesApi.getAll({ user_id: userId });
              const latestResume = resumesResponse.data?.[0];
              if (latestResume) {
                info('Refreshing job recommendations...');
                await fetchJobRecommendations();
              } else {
                error('Please upload a resume first');
              }
            }}
            className="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm hover:shadow-md"
            title="Manually trigger auto-apply"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh & Auto-Apply
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Industry</label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors"
              >
                <option value="">All Industries</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Location</label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors"
              >
                <option value="">All Locations</option>
                <option value="san-francisco">San Francisco, CA</option>
                <option value="new-york">New York, NY</option>
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Salary</label>
              <select
                value={filters.salary}
                onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-colors"
              >
                <option value="">All Salaries</option>
                <option value="100-150">$100k - $150k</option>
                <option value="150-200">$150k - $200k</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Job Recommendations Cards */}
      {loadingRecommendations ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <Loading message="Loading job recommendations..." />
        </div>
      ) : jobRecommendations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No job recommendations yet</h3>
            <p className="text-gray-600 mb-6">Upload a resume and click "Find & Apply Jobs" to see matched opportunities!</p>
            <button 
              onClick={() => window.location.href = '/resumes'}
              className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors shadow-sm hover:shadow-md"
            >
              Go to Resumes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobRecommendations.map((recommendation, index) => {
            const portal = recommendation.career_portal;
            const isApplied = applications.some(app => app.career_portal_id === portal.id);
            const application = isApplied ? applications.find(app => app.career_portal_id === portal.id) : null;
            const matchScore = recommendation.match_score;
            
            return (
              <div 
                key={portal.id || index} 
                className={`bg-white rounded-lg border-2 transition-all ${
                  isApplied ? 'border-green-200 bg-green-50/30' : 'border-gray-200 hover:border-gray-300'
                } hover:shadow-md`}
              >
                {/* Card Header */}
                <div className={`p-5 border-b ${isApplied ? 'border-green-200' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {portal.company_name || portal.name}
                        </h3>
                        {isApplied && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{portal.industry || 'General'}</p>
                    </div>
                    {isApplied && (
                      <div className="flex-shrink-0 ml-3">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold border border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Match Score */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {matchScore}% match
                      </span>
                    </div>
                    {application && (
                      <span className="text-xs text-gray-500">
                        ID: #{application.id}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  {/* Location & Salary */}
                  <div className="space-y-2">
                    {(portal.city || portal.state || portal.country) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">
                          {portal.city && portal.state 
                            ? `${portal.city}, ${portal.state}`
                            : portal.city 
                            ? portal.city
                            : portal.state
                            ? portal.state
                            : portal.country || 'Location not specified'}
                        </span>
                      </div>
                    )}
                    {portal.salary_min && portal.salary_max && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>
                          ${portal.salary_min.toLocaleString()} - ${portal.salary_max.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Keywords Matched */}
                  {recommendation.matched_keywords && recommendation.matched_keywords.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs font-medium text-gray-500 mb-2">Matched {recommendation.matched_keywords.length} keyword{recommendation.matched_keywords.length !== 1 ? 's' : ''}: {recommendation.matched_keywords.slice(0, 3).join(', ')}{recommendation.matched_keywords.length > 3 ? '...' : ''}</p>
                    </div>
                  )}

                  {/* Application Status */}
                  {isApplied && application && (
                    <div className="pt-2 border-t border-green-200">
                      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Application Confirmed
                            </p>
                            <div className="space-y-1.5 text-xs text-green-800">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Application ID:</span>
                                <span className="font-bold text-green-900">#{application.id}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Applied:</span>
                                <span className="font-semibold text-green-900">
                                  {application.application_date 
                                    ? new Date(application.application_date).toLocaleDateString() 
                                    : 'N/A'}
                                </span>
                              </div>
                              {application.notes && application.notes.includes('Match score') && (
                                <div className="pt-1.5 mt-1.5 border-t border-green-200">
                                  <span className="text-green-700">
                                    {application.notes.split('|')[0].trim()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer - Action Buttons */}
                <div className="px-5 pb-5">
                  <div className="flex gap-2">
                    <a
                      href={portal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium text-center flex items-center justify-center gap-2 transition-colors shadow-sm hover:shadow-md"
                    >
                      View Job
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {!isApplied ? (
                      <button 
                        onClick={async () => {
                          try {
                            const userId = parseInt(localStorage.getItem('userId') || '1');
                            const resumesResponse = await resumesApi.getAll({ user_id: userId });
                            const latestResume = resumesResponse.data?.[0];
                            
                            if (!latestResume) {
                              error('Please upload a resume first');
                              return;
                            }
                            
                            setPendingApplication({ portal, recommendation });
                            setShowConfirmModal(true);
                          } catch (err: any) {
                            console.error('Error preparing application:', err);
                            error(err.response?.data?.detail || err.message || 'Failed to prepare application');
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                      >
                        Apply Now
                      </button>
                    ) : (
                      <button 
                        onClick={() => window.location.href = '/history'}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                      >
                        View in History
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recommended Jobs from External API */}
      {showJobs && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Jobs</h2>
              <p className="text-gray-600">Job postings from external sources</p>
            </div>
            <button
              onClick={() => setShowJobs(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Hide Jobs
            </button>
          </div>

          {loadingJobs ? (
            <div className="text-center py-8">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No jobs found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{job.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{job.company}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    {job.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{job.location}</span>
                      </div>
                    )}
                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 flex-shrink-0" />
                        <span>
                          {job.salary_min && job.salary_max
                            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                            : job.salary_min
                            ? `From $${job.salary_min.toLocaleString()}`
                            : `Up to $${job.salary_max.toLocaleString()}`}
                        </span>
                      </div>
                    )}
                    {job.posted_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>Posted: {job.posted_date ? new Date(job.posted_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    )}
                  </div>

                  {job.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                  )}

                  <div className="flex gap-2 pt-4 border-t border-gray-100">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium text-center flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

