import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { Star, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface FeedbackFormProps {
    onBack: () => void;
}

export function FeedbackForm({ onBack }: FeedbackFormProps) {
    const [name, setName] = useState('');
    const [profession, setProfession] = useState('');
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Name is required');
            return;
        }
        if (!feedback.trim()) {
            setError('Feedback is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('profession', profession);
            formData.append('rating', rating.toString());
            formData.append('feedback', feedback);
            if (image) {
                formData.append('image', image);
            }

            await api.feedbacks.create(formData);
            setSuccess(true);

            // Reset form on success
            setTimeout(() => {
                onBack();
            }, 3000);

        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputBaseClasses = "appearance-none block w-full px-4 py-3 sm:py-4 bg-gray-900/50 border border-white/10 rounded-xl sm:rounded-2xl shadow-sm placeholder-gray-500 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 sm:text-sm transition-all";
    const labelClasses = "block text-sm sm:text-base font-bold text-white tracking-tight mb-2";

    return (
        <div className="min-h-[100dvh] bg-gray-950 text-white relative flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 z-20 animate-slide-up">
            
            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[600px] max-h-[600px] bg-blue-600/10 rounded-full blur-[100px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] bg-emerald-600/10 rounded-full blur-[100px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md mb-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600/20 to-sky-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)]">
                        <Star className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 fill-blue-400" />
                    </div>
                </div>
                <h2 className="text-center text-3xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-lg">
                    Share Your Experience
                </h2>
                <p className="mt-2 text-center text-sm sm:text-base text-gray-300 font-medium">
                    We'd love to hear about your journey with us
                </p>
            </div>

            <div className="relative z-10 w-full max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto mb-12">
                <div className="bg-white/5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-3xl sm:rounded-[2.5rem] border border-white/10 px-5 sm:px-8 md:px-12 py-8 sm:py-10 lg:py-12">

                    {success ? (
                        <div className="text-center py-8 sm:py-12 animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight">Thank you!</h3>
                            <p className="text-gray-400 mb-8 font-medium">
                                Your feedback has been submitted successfully and will help us improve our services.
                            </p>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 animate-[loading_3s_linear_forwards]" />
                            </div>
                            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
                                Redirecting...
                            </p>
                            <style>{`
                                @keyframes loading {
                                    0% { width: 0%; }
                                    100% { width: 100%; }
                                }
                            `}</style>
                        </div>
                    ) : (
                        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium">{error}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-6 sm:gap-8 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="name" className={labelClasses}>
                                        Full Name <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={inputBaseClasses}
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="profession" className={labelClasses}>
                                        Profession <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
                                    </label>
                                    <input
                                        id="profession"
                                        name="profession"
                                        type="text"
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        className={inputBaseClasses}
                                        placeholder="Travel Blogger"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Your Rating
                                </label>
                                <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900/50 border border-white/10 rounded-2xl p-4 sm:p-6 w-full gap-4 sm:gap-0">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="focus:outline-none cursor-pointer transition-transform hover:scale-110 p-1"
                                                onMouseEnter={() => setHoveredRating(star)}
                                                onMouseLeave={() => setHoveredRating(null)}
                                                onClick={() => setRating(star)}
                                            >
                                                <Star
                                                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-colors ${star <= (hoveredRating ?? rating)
                                                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                                                        : 'text-gray-700'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="bg-gray-950/80 px-6 py-3 rounded-xl border border-white/5 text-center w-full sm:w-auto">
                                        <span className="text-2xl sm:text-3xl text-blue-400 font-black block leading-none">{rating}.0</span>
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-widest mt-1 block">Out of 5</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="feedback" className={labelClasses}>
                                    Your Feedback <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    id="feedback"
                                    name="feedback"
                                    rows={5}
                                    required
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className={`${inputBaseClasses} resize-none`}
                                    placeholder="Tell us what you loved and how we can improve..."
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>
                                    Add a Photo <span className="text-gray-500 font-normal text-xs ml-1">(Optional)</span>
                                </label>
                                <div className="mt-2 flex justify-center px-6 pt-6 pb-8 border-2 border-dashed border-white/20 bg-gray-900/30 rounded-2xl hover:bg-gray-900/50 transition-colors group cursor-pointer">
                                    <div className="space-y-2 text-center w-full">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="mx-auto h-32 w-auto rounded-xl object-contain bg-gray-950 p-2 shadow-xl border border-white/10"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        removeImage();
                                                    }}
                                                    className="absolute -top-3 -right-3 cursor-pointer bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className="cursor-pointer block w-full h-full">
                                                <div className="p-4 bg-white/5 rounded-full inline-block mb-3 group-hover:bg-white/10 transition-colors">
                                                    <Upload className="mx-auto h-8 w-8 text-gray-400 group-hover:text-white transition-colors" />
                                                </div>
                                                <div className="flex text-sm text-gray-300 justify-center font-bold mb-1">
                                                    <span>Click to upload a file</span>
                                                    <input
                                                        id="image-upload"
                                                        name="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onChange={handleImageChange}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-4 w-full">
                                <button
                                    type="button"
                                    onClick={onBack}
                                    disabled={isSubmitting}
                                    className="w-full sm:w-1/3 flex justify-center cursor-pointer py-4 px-4 border border-white/10 rounded-xl sm:rounded-2xl shadow-sm text-sm sm:text-base font-bold text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white focus:outline-none transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-2/3 flex justify-center cursor-pointer py-4 px-4 border border-transparent rounded-xl sm:rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)] text-sm sm:text-base font-black text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 focus:outline-none disabled:opacity-50 transition-all uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Feedback'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
