import { useState, useEffect } from 'react';
import { applicationsApi, careerPortalsApi, jobsApi } from '../services/api';
import type { Application, CareerPortal } from '../types';
import { ExternalLink, MapPin, DollarSign, Calendar } from 'lucide-react';
import Loading from '../components/Loading';

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

export default function Home() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [showJobs, setShowJobs] = useState(false);
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    salary: '',
  });

  useEffect(() => {
    fetchApplications();
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
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Jobs for You</h1>
      <p className="text-gray-600 mb-6">
        Based on your profile and preferences • {loading ? 'Loading...' : `${applications.length} jobs found`}
      </p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filters.industry}
          onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Industry</option>
          <option value="technology">Technology</option>
          <option value="finance">Finance</option>
        </select>
        <select
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Location</option>
          <option value="san-francisco">San Francisco, CA</option>
          <option value="new-york">New York, NY</option>
        </select>
        <select
          value={filters.salary}
          onChange={(e) => setFilters({ ...filters, salary: e.target.value })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Salary</option>
          <option value="100-150">$100k - $150k</option>
          <option value="150-200">$150k - $200k</option>
        </select>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8">
          <Loading message="Loading applications..." />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">Start applying to see recommendations here!</p>
            <button 
              onClick={fetchJobs}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Companies
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div key={app.id} className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{app.job_title}</h3>
                  <p className="text-sm text-gray-600 truncate">{app.company_name}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  app.status === 'Applied' ? 'bg-gray-100 text-gray-800' :
                  app.status === 'Reviewing' ? 'bg-blue-100 text-blue-800' :
                  app.status === 'Interview' ? 'bg-purple-100 text-purple-800' :
                  app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                  app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {app.status}
                </span>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Applied: {new Date(app.application_date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  View Details
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                  Apply
                </button>
              </div>
            </div>
          ))}
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
                        <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
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

