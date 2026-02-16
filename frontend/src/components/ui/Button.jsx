import React from "react";

function Button({ children, type = "button", className = "" }) {
  return (
    <button
      type={type}
      className={`w-full py-3 bg-black text-white 
                  rounded-lg font-bold 
                  cursor-pointer 
                  hover:bg-gray-800 
                  transition duration-300 
                  ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
