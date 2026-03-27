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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Payment Verification Issue</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={onGoHome}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-2xl hover:shadow-lg transition-all font-medium"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const vendor = vendorInfo?.vendor || vendorInfo;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle className="w-14 h-14 text-green-500" />
                        </div>
                        {/* Confetti dots */}
                        <div className="absolute -top-2 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -top-1 right-0 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.3s" }} />
                        <div className="absolute bottom-2 -right-6 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: "0.6s" }} />
                        <div className="absolute bottom-0 -left-6 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: "0.9s" }} />
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Registration Complete! 🎉
                    </h1>
                    <p className="text-xl text-gray-600 max-w-md mx-auto">
                        Your payment was successful. Your vendor profile is now <span className="font-semibold text-green-600">under review</span>.
                    </p>
                </div>

                {/* Vendor Summary Card */}
                {vendor && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-5">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5" />
                                Registration Summary
                            </h2>
                        </div>

                        <div className="p-8 space-y-5">
                            {vendor.companyName && (
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Company</p>
                                        <p className="text-lg font-medium text-gray-900">{vendor.companyName}</p>
                                    </div>
                                </div>
                            )}

                            {vendor.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900">{vendor.email}</p>
                                    </div>
                                </div>
                            )}

                            {vendor.vendorType && (
                                <div className="flex items-start gap-3">
                                    <Tag className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500">Vendor Type</p>
                                        <p className="text-gray-900">{vendor.vendorType}</p>
                                    </div>
                                </div>
                            )}

                            {(vendor.services || vendor.vendorServices)?.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <Tag className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Services</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(vendor.services || vendor.vendorServices).map((s: string, i: number) => (
                                                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {vendor.branches?.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Branches</p>
                                        {vendor.branches.map((b: any, i: number) => (
                                            <p key={i} className="text-gray-900">{b.name} — {b.location}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                    <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
                    <ul className="text-blue-800 space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            Our team will review your vendor profile within 24–48 hours.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            Once approved, your listing will be visible to travelers.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold mt-0.5">•</span>
                            You will receive a confirmation email at the address you provided.
                        </li>
                    </ul>
                </div>

                {/* CTA */}
                <div className="text-center">
                    <button
                        onClick={onGoHome}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-2xl hover:shadow-xl transition-all text-lg font-medium hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
