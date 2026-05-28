import React, { useEffect, useState } from "react";
import { CheckCircle, Building2, Mail, Tag, MapPin, CreditCard, Loader2 } from "lucide-react";
import { api } from "../services/api";

interface PaymentSuccessProps {
    sessionId: string;
    onGoHome: () => void;
}

export function PaymentSuccess({ sessionId, onGoHome }: PaymentSuccessProps) {
    const [loading, setLoading] = useState(true);
    const [vendorInfo, setVendorInfo] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!sessionId) {
            setError("No session ID found.");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const data = await api.payments.getSuccessInfo(sessionId);
                setVendorInfo(data);
            } catch (err: any) {
                setError(err?.message || "Could not verify payment.");
            } finally {
                setLoading(false);
            }
        })();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950 text-white relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="text-center relative z-10">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-lg text-gray-400 font-medium tracking-wide">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950 text-white relative px-4">
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-red-600/10 rounded-full blur-[120px]" />
                </div>
                <div className="bg-gray-900/50 backdrop-blur-2xl border border-red-500/20 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-10 max-w-lg w-full text-center relative z-10">
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Payment Verification Issue</h1>
                    <p className="text-gray-400 mb-8 font-medium">{error}</p>
                    <button
                        onClick={onGoHome}
                        className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-2xl shadow-lg transition-all font-bold tracking-wide hover:scale-105 active:scale-95 border border-red-500/30"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const vendor = vendorInfo?.vendor || vendorInfo;

    return (
        <div className="min-h-[100dvh] bg-gray-950 text-white relative py-12 px-4 flex items-center justify-center">
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-2xl w-full mx-auto relative z-10 mt-8">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                        {/* Confetti dots */}
                        <div className="absolute -top-2 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -top-1 right-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                        <div className="absolute bottom-2 -right-6 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
                        <div className="absolute bottom-0 -left-6 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.9s" }} />
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tighter drop-shadow-lg">
                        Registration Complete! 🎉
                    </h1>
                    <p className="text-lg sm:text-xl text-gray-300 max-w-lg mx-auto font-medium">
                        Your payment was successful. Your vendor profile is now <span className="font-bold text-emerald-400">under review</span>.
                    </p>
                </div>

                {/* Vendor Summary Card */}
                {vendor && (
                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border-b border-white/10 px-6 sm:px-8 py-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                Registration Summary
                            </h2>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {vendor.companyName && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Company</p>
                                        <p className="text-lg font-bold text-white">{vendor.companyName}</p>
                                    </div>
                                </div>
                            )}

                            {vendor.email && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                        <Mail className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Email</p>
                                        <p className="text-base text-gray-200">{vendor.email}</p>
                                    </div>
                                </div>
                            )}

                            {vendor.vendorType && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                        <Tag className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Vendor Type</p>
                                        <p className="text-base text-gray-200">{vendor.vendorType}</p>
                                    </div>
                                </div>
                            )}

                            {(vendor.services || vendor.vendorServices)?.length > 0 && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                        <Tag className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Services</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(vendor.services || vendor.vendorServices).map((s: string, i: number) => (
                                                <span key={i} className="bg-white/5 border border-white/10 text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vendor.branches?.length > 0 && (
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0">
                                        <MapPin className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-400 font-bold uppercase tracking-wider mb-2">Branches</p>
                                        <div className="space-y-2">
                                            {vendor.branches.map((b: any, i: number) => (
                                                <div key={i} className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                                                    <span className="font-bold text-white">{b.name}</span> <span className="text-gray-400">— {b.location}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-900/20 border border-blue-500/20 rounded-3xl p-6 sm:p-8 mb-8 backdrop-blur-md">
                    <h3 className="font-bold text-blue-300 mb-4 text-lg">What happens next?</h3>
                    <ul className="text-gray-300 space-y-3 text-sm sm:text-base">
                        <li className="flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-0.5">•</span>
                            Our team will review your vendor profile within 24–48 hours.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-0.5">•</span>
                            Once approved, your listing will be visible to travelers.
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-400 font-bold mt-0.5">•</span>
                            You will receive a confirmation email at the address you provided.
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button
                        onClick={onGoHome}
                        className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-10 py-4 sm:py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all text-base sm:text-lg font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] border border-blue-500/30"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
