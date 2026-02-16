import React from "react";

function Card({ children, className = "" }) {
  return (
    <div
      className={`w-[500px] rounded-[25px] overflow-hidden 
                  shadow-[0_20px_40px_rgba(0,0,0,0.15)] 
                  bg-white ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
