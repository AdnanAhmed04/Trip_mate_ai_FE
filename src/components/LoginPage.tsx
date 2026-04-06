import { useState, type FormEvent } from "react";
import { Mail, Lock, MapPin, Plane, ArrowLeft } from "lucide-react";
import { Utensils, Bed, Repeat } from "lucide-react";


interface LoginPageProps {
  onSwitchToSignup: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onBack?: () => void;
}

export function LoginPage({ onSwitchToSignup, onLogin, onBack }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await onLogin(email.trim(), password);
    } catch (error: any) {
      setErrorMsg(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] grid md:grid-cols-2">

        {/* Left Side */}
        <div className="relative min-h-[320px] md:min-h-full">
          <img
            src="https://images.unsplash.com/photo-1654693289021-3ff2c9df4092?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGFlcmlhbHxlbnwxfHx8fDE3NjU4MjkzMzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Travel destination"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-br from-blue-700/85 via-sky-600/80 to-cyan-500/70" />

          <div className="relative flex flex-col  justify-center z-20  h-full p-8 md:p-10 text-white">
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

            <div>
              <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
                Welcome Back!
              </h2>
              <p className="max-w-md text-sm md:text-base text-white/90 leading-7">
                Sign in to manage bookings, explore destinations, and continue planning your next adventure.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 md:py-12">
          {onBack && (
            <button
              onClick={onBack}
              className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <div className="mb-8">


            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Access your trip planning dashboard
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-13 w-full rounded-2xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm mt-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline "
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-3 mt-4 text-white font-medium shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}