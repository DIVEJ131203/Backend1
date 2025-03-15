import React, { useEffect, useState } from 'react';

const Rating = ({ initialRating, onRate }) => {
    const [rating, setRating] = useState(initialRating || 0);

    const handleRating = (value) => {
        setRating(value);
        if (onRate) onRate(value);
    };

    useEffect(() => {
        if (initialRating !== undefined) {
            setRating(initialRating);
        }
    }, [initialRating]); // ✅ Corrected `useEffect`

    return (
        <div>
            {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1; // ✅ Fixed capitalization
                return (
                    <span
                        key={index}
                        onClick={() => handleRating(starValue)} // ✅ Used arrow function to avoid immediate execution
                        className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
                            starValue <= rating ? 'text-yellow-500' : 'text-gray-500'
                        }`}
                    >
                        &#9733;
                    </span>
                );
            })}
        </div>
    );
};

export default Rating;
