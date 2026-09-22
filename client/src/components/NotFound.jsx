import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="py-10 bg-white font-serif overflow-hidden min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="w-full text-center">
            <div 
              className="h-[400px] sm:h-[500px] bg-center bg-no-repeat w-full"
              style={{ backgroundImage: "url('https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif')" }}
            >
              <h1 className="text-center text-7xl sm:text-[80px] font-bold text-black mt-10">
                404
              </h1>
            </div>

            <div className="mt-[-30px] sm:mt-[-50px]">
              <h3 className="text-3xl sm:text-5xl font-bold text-black mb-2">
                Look like you're lost
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                the page you are looking for not available!
              </p>
              
              <Link 
                to="/" 
                className="text-white px-5 py-3 bg-[#39ac31] inline-block font-semibold rounded hover:bg-green-600 transition-colors duration-300"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
