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

  // Character limit for truncation
  const MAX_LENGTH = 120;
  const shouldTruncate = review.review.length > MAX_LENGTH;

  const displayReview = shouldTruncate && !isExpanded
    ? `${review.review.slice(0, MAX_LENGTH)}...`
    : review.review;

  return (
    <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg text-center h-full flex flex-col justify-between">
      <div>
        <img
          src={review.image}
          alt={review.name}
          className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
        />
        <h3 className="text-xl font-semibold mb-2 text-gray-300">{review.name}</h3>
        <p className="text-sm mb-4 text-gray-300">{review.title}</p>

        <p className="text-gray-300 mb-2">
          {displayReview}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="cursor-pointer ml-2 font-medium focus:outline-none"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>
      </div>

      <div className="flex justify-center mt-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-500'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            stroke="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 15l-3.09 1.633a1 1 0 01-1.45-1.054l.586-3.51-2.56-2.493a1 1 0 01.554-1.71l3.508-.51 1.56-3.16a1 1 0 011.898 0l1.56 3.16 3.508.51a1 1 0 01.554 1.71l-2.56 2.493.586 3.51a1 1 0 01-1.45 1.054L10 15z"
              clipRule="evenodd"
            />
          </svg>
        ))}
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
    <div className="relative  m-auto overflow-hidden py-12  ">
      <div className="flex flex-col items-center mb-8 mt-6">
        <h2 className="text-4xl text-white font-extrabold text-center mb-4">
          What People Love About Us
        </h2>
        {onLeaveFeedback && (
          <button
            onClick={onLeaveFeedback}
            className="bg-white/10 cursor-pointer hover:bg-white/20 text-white border border-white/30 px-6 py-2 rounded-full transition-all font-medium text-sm flex items-center gap-2"
          >
            Leave Feedback
          </button>
        )}
      </div>

      <div className="overflow-hidden w-full  relative">
        <div
          className="flex transition-transform duration-500 ease-in-out items-stretch"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
        >
          {reviews.map((review, index) => (
            <div
              key={index}
              className="px-4 mb-6 flex-shrink-0 flex"
              style={{ width: `${100 / itemsPerPage}%` }}
            >
              <div className="w-full h-full">
                <ReviewItem review={review} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      {/* <div className="absolute top-1/2 left-0 transform -translate-y-1/2 text-white text-4xl cursor-pointer z-10" onClick={prevSlide}>
        &#8249;
      </div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 text-white text-4xl cursor-pointer z-10" onClick={nextSlide}>
        &#8250;
      </div> */}
    </div>
  );
};

export default CustomerReviewSlider;
