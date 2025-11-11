import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, healthApi } from '../services/api';
import Logo from '../components/Logo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await healthApi.check();
        setBackendStatus('online');
        console.log('✅ Backend is online');
      } catch (err: any) {
        setBackendStatus('offline');
        if (err.code === 'ECONNREFUSED' || err.message?.includes('ERR_CONNECTION')) {
          setError('Backend server is not running. Please start the backend server first.');
          console.error('❌ Backend is offline. Start it with: cd applytomation-backend && ./run.sh');
        }
      }
    };
    checkBackendHealth();
  }, []);

  // Error message will NOT auto-close - stays visible until manually dismissed or successful login


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Don't clear error on submit - let it persist until successful login
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        try {
          const response = await authApi.login({ email, password, otp_code: otpRequired ? otpCode : undefined });
          // Clear error only on successful login
          setError(null);
          localStorage.setItem('token', response.data.access_token);
          if (response.data.user_id) {
            localStorage.setItem('userId', response.data.user_id.toString());
          }
          navigate('/home');
        } catch (err: any) {
          // Check if OTP is required (status 202)
          if (err.response?.status === 202 || err.response?.headers?.['x-otp-required'] === 'true') {
            setOtpRequired(true);
            setOtpSent(true);
            setError(err.response?.data?.detail || 'Please enter the OTP sent to your email');
            // OTP is automatically sent by backend, no need to request separately
            return;
          }
          throw err;
        }
      } else {
        // Register
        await authApi.register({ email, password });
        // After registration, automatically log in
        const response = await authApi.login({ email, password });
        // Clear error only on successful registration/login
        setError(null);
        localStorage.setItem('token', response.data.access_token);
        if (response.data.user_id) {
          localStorage.setItem('userId', response.data.user_id.toString());
        }
        navigate('/home');
      }
    } catch (err: any) {
      // Handle connection errors with user-friendly messages
      if (err.code === 'ECONNREFUSED' || err.message?.includes('ERR_CONNECTION') || err.userMessage) {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        setError(
          `Cannot connect to backend server at ${apiUrl}. ` +
          `Please ensure the backend is running. ` +
          `Start it with: cd applytomation-backend && ./run.sh`
        );
        setBackendStatus('offline');
      } else if (err.code === 'ETIMEDOUT' || err.message?.includes('timeout')) {
        setError('Request timed out. The server may be slow or unresponsive. Please try again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred. Please try again.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50/30 via-blue-50/20 to-white flex">
      {/* Left Side - Insights & Features Dashboard - Very Light Blue Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50/40 via-blue-50/20 to-blue-50/30 p-8 flex-col justify-between relative overflow-hidden">
        {/* Very subtle background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>
        
        {/* Top Section */}
        <div className="relative z-10">
          {/* Decorative Icon/Illustration instead of Logo */}
          <div className="mb-8 flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg" style={{ boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)' }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900">Smart Automation</h2>
              <p className="text-sm text-blue-700">Powered by AI</p>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Unlock Your Career Potential</h1>
          <p className="text-xl text-gray-700 mb-8">Automate job applications and land your dream job faster</p>
        </div>

        {/* Dashboard Preview */}
        <div className="relative z-10 bg-white rounded-2xl p-6 border-2 border-blue-200" style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-blue-200" style={{ boxShadow: '0 1px 4px rgba(59, 130, 246, 0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm font-semibold">Applications Sent</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-blue-600">1,247</div>
              <div className="text-blue-500 text-xs mt-1 font-medium">+32% This Month</div>
            </div>
            
            <div className="bg-white rounded-lg p-4 border border-blue-200" style={{ boxShadow: '0 1px 4px rgba(59, 130, 246, 0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 text-sm font-semibold">Job Matches</span>
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-blue-600">89</div>
              <div className="text-blue-500 text-xs mt-1 font-medium">+18% This Week</div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="bg-white rounded-lg p-4 border border-blue-200" style={{ boxShadow: '0 1px 4px rgba(59, 130, 246, 0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 text-sm font-semibold">Application Success Rate</span>
              <span className="text-blue-600 font-bold">94%</span>
            </div>
            <div className="w-full bg-blue-100 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="relative z-10 mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-blue-200" style={{ boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)' }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-gray-700 text-xs font-semibold">Auto Apply</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-blue-200" style={{ boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)' }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-xs font-semibold">Smart Matching</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 border-2 border-blue-200" style={{ boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)' }}>
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-700 text-xs font-semibold">Track Progress</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 border border-gray-200" style={{ boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.15), 0 4px 12px -2px rgba(59, 130, 246, 0.1)' }}>
            {/* Logo - Mobile/Tablet */}
            <div className="mb-6 lg:hidden flex justify-center">
              <Logo size="md" showText={true} showSubtitle={true} />
            </div>
            
            {/* Logo - Desktop (smaller like previous) */}
            <div className="mb-6 hidden lg:block flex justify-center">
              <Logo size="sm" showText={true} showSubtitle={false} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Login to APPLYTOMATION</h2>
            <p className="text-gray-600 mb-6 text-center">See what's going on with your job applications</p>

          {/* Backend Status Indicator */}
          {backendStatus !== 'checking' && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              backendStatus === 'online' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                backendStatus === 'online' ? 'text-green-800' : 'text-red-800'
              }`}>
                {backendStatus === 'online' 
                  ? 'Backend server is online' 
                  : 'Backend server is offline'}
              </span>
            </div>
          )}

          {/* Error message - always visible when error exists, even during loading */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 font-medium flex-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-600 hover:text-red-800 flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                  aria-label="Dismiss error"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {otpSent && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">OTP sent to {email}. Please check your email inbox.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {otpRequired && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  OTP Code
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp"
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        // Don't clear error when resending OTP - let user see previous errors
                        const { otpApi } = await import('../services/api');
                        await otpApi.request({ email });
                        setOtpSent(true);
                        // Don't clear error - keep it visible
                      } catch (err: any) {
                        setError(err.response?.data?.detail || 'Failed to resend OTP');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    Resend
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the 6-digit code sent to your email
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                isLogin ? 'Sign in' : 'Sign up'
              )}
            </button>
            
            {/* Show loading indicator below button if loading, but keep form visible */}
            {loading && !otpRequired && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500">Please wait...</p>
              </div>
            )}
          </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setOtpRequired(false);
                  setOtpCode('');
                  setOtpSent(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                © 2024-2025 Copyright APPLYTOMATION
              </p>
              <div className="mt-2 flex justify-center gap-4 text-xs text-gray-500">
                <a href="#" className="hover:text-blue-600">Terms of Use</a>
                <span>•</span>
                <a href="#" className="hover:text-blue-600">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
