import React, { useMemo, useState } from 'react';
import { Lock, User, MapPin, Plane, ArrowLeft, Mail } from 'lucide-react';
import { Utensils, Bed, Repeat } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center">      <div className="w-full max-w-6xl  max-h-[85vh] grid md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Left side - Signup form */}
      <div className="p-4 md:p-10 flex flex-col justify-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="relative z-20 self-start flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        )}

        <div className="mb-4">
          <h1 className="text-3xl mb-2 font-semibold">Create Account</h1>
          <p className="text-gray-600">Start planning your dream trips</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            {passwordTooShort && (
              <p className="mt-1 text-xs text-amber-600">
                Password must be at least 6 characters.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Confirm password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                minLength={6}
                className={`h-10 w-full rounded-2xl border bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${passwordsMatch
                  ? 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                  : 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  }`}
              />
            </div>
            {!passwordsMatch && (
              <p className="mt-1 text-xs text-red-600">
                Passwords do not match.
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <label className="flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="leading-6">
                I agree to the{' '}
                <button
                  type="button"
                  className="font-medium cursor-pointer text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  className="font-medium cursor-pointer text-blue-600 transition hover:text-blue-700 hover:underline"
                >
                  Privacy Policy
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-10 bg-blue-500 hover:bg-blue-600 w-full items-center justify-center cursor-pointer rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className=" text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Image and branding */}
      <div className="relative min-h-[280px] md:min-h-0">
        <img
          src="https://images.unsplash.com/photo-1654693289021-3ff2c9df4092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGFlcmlhbHxlbnwxfHx8fDE3NjU4MjkzMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Travel destination"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-600/90 flex flex-col justify-center items-center text-white p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-3 ">

              <div className="flex items-center gap-4 text-white ">
                <div className="flex flex-col items-center gap-2">
                  <Utensils className="w-8 h-8" />
                  <span>Eat</span>
                </div>



                <div className="flex flex-col items-center gap-2">
                  <Plane className="w-8 h-8" />
                  <span>Travel</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Bed className="w-8 h-8" />
                  <span>Sleep</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Repeat className="w-8 h-8" />
                  <span>Repeat</span>
                </div>
              </div>

            </div>
          </div>
          <h2 className="text-4xl mb-4 text-center font-semibold">
            Join Our Community
          </h2>
          <p className="text-center text-lg opacity-90">
            Discover, plan, and share amazing travel experiences
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}