import { useState } from 'react';
import { Mail, Lock, User, Github, ArrowLeft } from 'lucide-react';
import { login, signup } from '../lib/api';

interface LoginProps {
  onBack?: () => void;
}

export default function Login({ onBack }: LoginProps = {}) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }

    if (activeTab === 'signup') {
      if (!formData.name) {
        setError('Full name is required.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    try {
      setSubmitting(true);
      const result =
        activeTab === 'login'
          ? await login({ email: formData.email, password: formData.password })
          : await signup({ name: formData.name, email: formData.email, password: formData.password });

      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const OAuthButton = ({
    provider,
    icon,
    bgColor,
    hoverColor,
  }: {
    provider: string;
    icon: React.ReactNode;
    bgColor: string;
    hoverColor: string;
  }) => (
    <button
      type="button"
      className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg ${bgColor} ${hoverColor} transition-all duration-200 border border-gray-200 hover:shadow-md`}
    >
      {icon}
      <span className="font-['Athiti:Medium',sans-serif] text-sm">Continue with {provider}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12 relative">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-['Athiti:Medium',sans-serif] text-sm">Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-['Athiti:Bold',sans-serif] text-4xl mb-2">Bio Research Team</h1>
          <p className="text-gray-600 font-['Athiti:Regular',sans-serif]">Welcome back! Please login to your account.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex gap-2 mb-8 bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-full font-['Athiti:Medium',sans-serif] text-sm transition-all duration-200 ${
                activeTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 rounded-full font-['Athiti:Medium',sans-serif] text-sm transition-all duration-200 ${
                activeTab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-['Athiti:Medium',sans-serif] text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-['Athiti:Medium',sans-serif] text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-['Athiti:Medium',sans-serif] text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {activeTab === 'signup' && (
              <div>
                <label className="block text-sm font-['Athiti:Medium',sans-serif] text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            {activeTab === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-700 font-['Athiti:Regular',sans-serif]"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {message && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</p>}
            {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white py-3 rounded-xl font-['Athiti:SemiBold',sans-serif] transition-all duration-200 hover:shadow-lg disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-['Athiti:Regular',sans-serif]">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              provider="Google"
              bgColor="bg-white"
              hoverColor="hover:bg-gray-50"
              icon={
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              }
            />

            <OAuthButton provider="GitHub" bgColor="bg-white" hoverColor="hover:bg-gray-50" icon={<Github className="w-5 h-5" />} />
          </div>

          <p className="mt-6 text-xs text-center text-gray-500 font-['Athiti:Regular',sans-serif]">
            By continuing, you agree to the Bio Research Team's <button className="text-blue-600 hover:underline">Terms of Service</button> and <button className="text-blue-600 hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}