import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center  from-indigo-900 via-purple-800 to-indigo-900">

      <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl  text-center">

        <h1 className="text-4xl font-bold text-purple-900 mb-3">
          HomeGuard
        </h1>

        <p className="text-black mb-8">
          <i> Secure Property Inspection System </i>
        </p>

        <div className="space-y-4">

          <Link to="/login">
            <button className="w-full bg-purple-900 text-white py-3 rounded-xl hover:bg-purple-800 transition duration-300 shadow-md">
              Login
            </button>
          </Link>

          <Link to="/register/owner">
            <button className="w-full bg-black text-white py-3 rounded-xl hover:bg-black transition duration-300 shadow-md">
              Register
            </button>
          </Link>

        </div>

      </div>

    </div>
  );
}

export default LandingPage;
