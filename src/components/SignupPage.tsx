import React, { useMemo, useState } from 'react';
import { Lock, User, Plane, ArrowLeft, Mail, Utensils, Bed, Repeat, Sparkles, ShieldCheck } from 'lucide-react';
import navlogo from "../navlogo.png";

interface SignupPageProps {
  onSwitchToLogin: () => void;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onBack?: () => void;
}

export function SignupPage({
  onSwitchToLogin,
  onSignup,
  onBack,
}: SignupPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const passwordTooShort = useMemo(
    () => password.length > 0 && password.length < 6,
    [password]
  );

  const passwordsMatch = useMemo(() => {
    if (confirmPassword.length === 0) return true;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }

    setIsLoading(true);

    try {
      await onSignup(name.trim(), email.trim(), password);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Signup failed. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-6xl relative z-10 grid md:grid-cols-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-slide-up">

        {/* Left Side: Visual Content */}
        <div className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1539635278303-d4002c07dee3?auto=format&fit=crop&q=80&w=1000"
              alt="Travelers"
              className="w-full h-full object-cover opacity-40 scale-110 animate-pulse-subtle"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-gray-950/90 to-gray-950" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="flex items-center cursor-pointer transition-transform hover:scale-105">
                <img
                  src={navlogo}
                  className="h-26 w-auto object-contain"
                  alt="TripMate Logo"
                />
              </div>
            </div>

            <h2 className="text-7xl font-black leading-[1.1] tracking-tighter mb-6">
              Start Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 italic">Elite Journey</span>
            </h2>
            <p className="text-gray-400 text-xl leading-relaxed max-w-md">
              Join thousands of global travelers and experience the future of personalized AI trip planning.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4">
            {[
              { icon: <Utensils className="w-5 h-5" />, label: "Eat" },
              { icon: <Plane className="w-5 h-5" />, label: "Travel" },
              { icon: <Bed className="w-5 h-5" />, label: "Sleep" },
              { icon: <Repeat className="w-5 h-5" />, label: "Repeat" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                <div className="text-blue-400">{item.icon}</div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-8 left-8 sm:left-12 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
          )}

          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3">Create Account</h1>
            <p className="text-gray-500 font-medium">Join our global community of explorers</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-shake">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@adventure.com"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={`w-full h-12 bg-white/5 border ${passwordTooShort ? 'border-amber-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className={`w-full h-12 bg-white/5 border ${!passwordsMatch ? 'border-red-500/50' : 'border-white/10'} rounded-2xl pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all text-sm font-medium`}
                  />
                </div>
              </div>
            </div>

            <div className="flex  items-start gap-3 px-1 py-2">
              <label className="flex items-center gap-3 cursor-pointer group ">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" required className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-white/10 rounded-lg bg-white/5 peer-checked:bg-blue-600 peer-checked:border-blue-500 transition-all" />
                  <Sparkles className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </label>
              <p className="text-[12px] leading-tight text-gray-400 font-bold uppercase tracking-widest">
                I agree to the <button type="button" className="text-blue-400 hover:underline">Terms of Service</button> and <button type="button" className="text-blue-400 hover:underline">Privacy Policy</button>
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer h-14 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center gap-3 group mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Elite Account</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">
              Already an Explorer?{" "}
              <button
                onClick={onSwitchToLogin}
                className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors ml-1"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}