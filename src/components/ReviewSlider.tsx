import React, { useState, useEffect } from 'react';

// Define the shape of each review
interface Review {
  image: string;
  name: string;
  title: string;
  review: string;
  rating: number;
}

// Sample reviews data with the correct typing
const reviews: Review[] = [
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

const CustomerReviewSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0); // Type currentIndex
  const reviewsPerPage = 3;

  // Function to get reviews for the current slide
  const getCurrentReviews = (): Review[] => {
    const start = currentIndex * reviewsPerPage;
    const end = start + reviewsPerPage;
    return reviews.slice(start, end);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(reviews.length / reviewsPerPage));
    }, 3000); // Slide every 3 seconds

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, []);

  const nextSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.ceil(reviews.length / reviewsPerPage));
  };

  const prevSlide = (): void => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + Math.ceil(reviews.length / reviewsPerPage)) % Math.ceil(reviews.length / reviewsPerPage));
  };

  return (
    <div className="relative w-[70%]  sm:w-[80%] md:w-[70%] lg:w-[50%] m-auto overflow-hidden py-12  ">
      <h2 className="text-4xl text-white font-extrabold text-center mb-6 mt-6">
        What People Love About Us
      </h2>
      <div className="flex transition-transform duration-500 ease-in-out">
        {getCurrentReviews().map((review, index) => (
          <div key={index} className="w-full sm:w-1/2 md:w-1/3 px-4 mb-6">
            <div className="bg-gray-900 text-white p-6 rounded-xl shadow-lg text-center">
              <img
                src={review.image}
                alt={review.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-300">{review.name}</h3>
              <p className="text-sm mb-4 text-gray-300">{review.title}</p>
              <p className="text-gray-300 mb-4">{review.review}</p>
              <div className="flex justify-center mb-4">
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
          </div>
        ))}
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
