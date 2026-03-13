import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const { login, error, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        {/* Logo / Brand */}
        <img src="/logo-dark.jpg" alt="Roaring Brook Recovery" className="w-20 h-20 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Compliance Hub</h1>
        <p className="text-slate-500 text-sm mb-1">Roaring Brook Recovery</p>
        <p className="text-slate-400 text-xs mb-8">Behavioral Health GRC Platform</p>

        {/* Login Button */}
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={18} />
              Sign in with Microsoft
            </>
          )}
        </button>

        {error && (
          <p className="text-red-500 text-xs mt-4">{error}</p>
        )}

        <p className="text-slate-400 text-xs mt-6">
          Sign in with your @roaringbrookrecovery.com account
        </p>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">TJC</p>
            <p className="text-[10px] text-slate-400">Joint Commission</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">CARF</p>
            <p className="text-[10px] text-slate-400">Accreditation</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold text-slate-600">HIPAA</p>
            <p className="text-[10px] text-slate-400">Compliance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
