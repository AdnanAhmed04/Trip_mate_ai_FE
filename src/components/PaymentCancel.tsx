import React from "react";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

interface PaymentCancelProps {
    onGoHome: () => void;
    onRetry: () => void;
}

export function PaymentCancel({ onGoHome, onRetry }: PaymentCancelProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50 px-4">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-14 h-14 text-orange-500" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Payment Cancelled
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-sm mx-auto">
                    Your registration was saved but payment was not completed. You can retry the payment to activate your vendor listing.
                </p>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8 text-left">
                    <p className="text-amber-800 text-sm">
                        <strong>Don't worry!</strong> Your registration data has been saved. You just need to complete the payment step to make your listing visible to travelers.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={onRetry}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-medium hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Retry Payment
                    </button>
                    <button
                        onClick={onGoHome}
                        className="flex items-center justify-center gap-2 bg-gray-100 text-gray-800 px-8 py-4 rounded-2xl hover:bg-gray-200 transition-all font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}
