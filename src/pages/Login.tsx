import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, healthApi } from '../services/api';
import { Mail, Lock, Shield, CheckCircle2, AlertCircle, X, Loader2, Briefcase, TrendingUp, Target } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50/30 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-blue-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white text-2xl font-black">A</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">APPLYTOMATION</h2>
              <p className="text-sm text-blue-100 font-medium">Job Automation Portal</p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h1 className="text-5xl font-black text-white mb-4 leading-tight">
              Find Your Dream Job
              <br />
              <span className="text-blue-100">Faster</span>
            </h1>
            <p className="text-xl text-blue-100 font-medium">
              Automate applications and match with the perfect opportunities
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 flex-shrink-0">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Smart Job Matching</h3>
                <p className="text-blue-100 text-sm">AI-powered matching based on your resume keywords</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Auto Apply</h3>
                <p className="text-blue-100 text-sm">Automatically apply to jobs that match your profile</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Track Progress</h3>
                <p className="text-blue-100 text-sm">Monitor all your applications in one place</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-black text-white mb-1">1,247+</div>
            <div className="text-sm text-blue-100">Applications</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white mb-1">89+</div>
            <div className="text-sm text-blue-100">Matches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white mb-1">94%</div>
            <div className="text-sm text-blue-100">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-black">A</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">APPLYTOMATION</h2>
              <p className="text-xs text-gray-500">Job Automation Portal</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to continue your job search journey</p>
            </div>

            {/* Backend Status Indicator */}
            {backendStatus !== 'checking' && (
              <div className={`mb-6 p-3 rounded-lg flex items-center gap-2.5 ${
                backendStatus === 'online' 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-red-50 border-2 border-red-200'
              }`}>
                {backendStatus === 'online' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`text-sm font-semibold ${
                  backendStatus === 'online' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {backendStatus === 'online' 
                    ? 'Backend server is online' 
                    : 'Backend server is offline'}
                </span>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 font-medium flex-1">{error}</p>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0 p-1 hover:bg-red-100 rounded-lg transition-colors"
                    aria-label="Dismiss error"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {otpSent && (
              <div className="mb-6 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">OTP sent to {email}. Please check your email inbox.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    placeholder="you@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                </div>
              </div>

              {otpRequired && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="otp"
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        disabled={loading}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const { otpApi } = await import('../services/api');
                          await otpApi.request({ email });
                          setOtpSent(true);
                        } catch (err: any) {
                          setError(err.response?.data?.detail || 'Failed to resend OTP');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="px-5 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
                    >
                      Resend
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Enter the 6-digit code sent to your email
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign in' : 'Sign up'}</span>
                  </>
                )}
              </button>
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
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
            
            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500 font-medium">
                © 2024-2025 Copyright APPLYTOMATION
              </p>
              <div className="mt-3 flex justify-center gap-4 text-xs">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Terms of Use</a>
                <span className="text-gray-300">•</span>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
