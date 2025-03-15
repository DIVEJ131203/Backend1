import React from 'react';
import { assets, dummyTestimonial } from '../../assets/assets';

const TestimonialSection = () => {
  return (
    <div className="pb-14 px-8 md:px-0">
      <h2 className="text-3xl font-medium text-gray-800">Testimonials</h2>
      <p className="md:text-base text-gray-500 mt-3">
        Hear from our learners as they share their journey of transformation, success, and how our <br />
        platform has made a difference in their lives.
      </p>
      <div className="mt-6 grid gap-6 grid-cols-auto lg:grid-cols-3">
        {dummyTestimonial.map((testimonial, index) => (
          <div key={index} className="border p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-lg font-semibold">{testimonial.name}</h1>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
            <div className="p-5 pb-7 mt-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <img
                    key={i}
                    src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
                    alt="star"
                    className="w-5 h-5"
                  />
                ))}
              </div>
              <p className='text-gray-500 mt-5'>{testimonial.feedback}</p>
            </div>
            <a href="#" className='text-blue-500 '>Read more...</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;
