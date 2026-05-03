import React, { useState, useEffect } from 'react';

// Define the shape of each review
interface Review {
  image: string;
  name: string;
  title: string;
  review: string;
  rating: number;
}

import { api, BASE_URL } from '../services/api';

// Sample reviews data with the correct typing
const staticReviews: Review[] = [
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).webp',
    name: 'Anna Deynah',
    title: 'UX Designer',
    review: "Tripmate made my travel experience unforgettable! The app helped me find the perfect itinerary, and I even met some amazing fellow travelers along the way. Highly recommended!",
    rating: 5,
  },
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(1).webp',
    name: 'John Doe',
    title: 'Web Developer',
    review: "I can't thank Tripmate enough for organizing my trip so seamlessly. From booking my flights to finding a travel buddy, everything was so easy. I'll definitely use this service again!",
    rating: 4.75,
  },
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(3).webp',
    name: 'Maria Kate',
    title: 'Photographer',
    review: "What a fantastic service! I was able to connect with fellow travelers, share tips, and explore new destinations. Tripmate really made my trip enjoyable and stress-free!",
    rating: 3.5,
  },
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(4).webp',
    name: 'Jane Smith',
    title: 'Designer',
    review: "Tripmate made my solo trip so much more enjoyable! I found travel companions with similar interests, and it was great to share experiences. I will definitely use this app for future adventures!",
    rating: 4,
  },
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(3).webp',
    name: 'Maria Kate',
    title: 'Photographer',
    review: `I’ve never had such an easy time planning a trip. With Tripmate, I was able to find the best deals, book activities, and get personalized recommendations. It's the only app I’ll use from now on!`,
    rating: 4.5,
  },
  {
    image: 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(4).webp',
    name: 'Jane Smith',
    title: 'Designer',
    review: "Absolutely loved using Tripmate for my recent vacation. The platform is user-friendly, and the ability to find and join group tours made my experience so much richer. Can’t wait to plan my next trip!",
    rating: 4,
  },
];

const ReviewItem: React.FC<{ review: Review }> = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const MAX_LENGTH = 150;
  const shouldTruncate = review.review.length > MAX_LENGTH;

  const displayReview = shouldTruncate && !isExpanded
    ? `${review.review.slice(0, MAX_LENGTH)}...`
    : review.review;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center text-center h-full group hover:bg-white/10 transition-all duration-500 relative overflow-hidden">
      {/* Decorative Quote Icon */}
      <div className="absolute top-6 right-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
        <svg width="45" height="35" viewBox="0 0 45 35" fill="currentColor">
          <path d="M13.5 0C6.045 0 0 6.045 0 13.5C0 20.955 6.045 27 13.5 27H15.75V35L24.75 27V13.5C24.75 6.045 18.705 0 13.5 0ZM38.25 0C30.795 0 24.75 6.045 24.75 13.5C24.75 20.955 30.795 27 38.25 27H40.5V35L49.5 27V13.5C49.5 6.045 43.455 0 38.25 0Z" />
        </svg>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center h-full">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:blur-2xl transition-all"></div>
          <img
            src={review.image}
            alt={review.name}
            className="w-24 h-24 rounded-full border-4 border-white/10 object-cover relative z-10 shadow-xl group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < Math.floor(review.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <p className="text-gray-300 italic leading-relaxed mb-6 text-base flex-1">
          "{displayReview}"
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-400 hover:text-blue-300 cursor-pointer ml-2 text-sm font-bold transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        <div className="mt-auto">
          <h3 className="text-lg font-bold text-white tracking-wide">{review.name}</h3>
          <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">{review.title}</p>
        </div>
      </div>
    </div>
  );
};

interface CustomerReviewSliderProps {
  onLeaveFeedback?: () => void;
}

const CustomerReviewSlider: React.FC<CustomerReviewSliderProps> = ({ onLeaveFeedback }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsPerPage(1);
      else if (window.innerWidth < 1024) setItemsPerPage(2);
      else setItemsPerPage(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const fetchedFeedbacks = await api.feedbacks.getAll();

        if (fetchedFeedbacks && fetchedFeedbacks.length > 0) {
          // Sort latest first
          const sortedFeedbacks = [...fetchedFeedbacks].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });

          // Map to Review interface
          const formattedReviews: Review[] = sortedFeedbacks.map((f: any) => {
            let img = 'https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(32).webp';
            if (f.image) {
              if (f.image.startsWith('http') || f.image.startsWith('data:')) {
                img = f.image;
              } else {
                // Make sure no double slash
                const cleanPath = f.image.startsWith('/') ? f.image.slice(1) : f.image;
                // For uploads, if it doesn't have the uploads folder attached in db, we might need to add it,
                // but according to tests it's returned as is.
                img = `${BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
              }
            }

            return {
              image: img,
              name: f.name || 'Anonymous',
              title: f.profession || 'Customer',
              review: f.feedback,
              rating: typeof f.rating === 'number' ? f.rating : 5
            };
          });

          // Pad with static if real ones are too few to make a full row of 3
          if (formattedReviews.length >= 3) {
            setReviews(formattedReviews);
          } else {
            setReviews([...formattedReviews, ...staticReviews.slice(0, 3 - formattedReviews.length)]);
          }
        } else {
          setReviews(staticReviews);
        }
      } catch (err) {
        console.error("Failed to fetch feedbacks:", err);
        setReviews(staticReviews);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const maxIndex = Math.max(0, reviews.length - itemsPerPage);
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval);
  }, [reviews.length, itemsPerPage]);

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, reviews.length - itemsPerPage);
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex) => {
      const maxIndex = Math.max(0, reviews.length - itemsPerPage);
      return prevIndex <= 0 ? maxIndex : prevIndex - 1;
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto overflow-hidden py-20 px-6">
      <div className="flex flex-col items-center mb-16">
        <div className="inline-block bg-blue-600/20 backdrop-blur-md text-blue-400 px-4 py-2 rounded-full mb-6 border border-blue-500/20">
          <span className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
            ⭐ Customer Testimonials
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center mb-8 tracking-tight">
          What People Love About Us
        </h2>
        {onLeaveFeedback && (
          <button
            onClick={onLeaveFeedback}
            className="bg-blue-600/40 backdrop-blur-md cursor-pointer hover:bg-blue-600/60 text-white border border-white/20 px-8 py-3 rounded-full transition-all font-bold text-sm flex items-center gap-2 shadow-2xl hover:scale-105 active:scale-95"
          >
            Leave Feedback
          </button>
        )}
      </div>

      <div className="relative">
        <div className="overflow-hidden w-full relative">
          <div
            className="flex transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] items-stretch"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
          >
            {reviews.map((review, index) => (
              <div
                key={index}
                className="px-4 mb-12 flex-shrink-0 flex"
                style={{ width: `${100 / itemsPerPage}%` }}
              >
                <div className="w-full h-full">
                  <ReviewItem review={review} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: Math.max(0, reviews.length - itemsPerPage + 1) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                currentIndex === i ? 'w-8 bg-blue-500' : 'w-2.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviewSlider;
