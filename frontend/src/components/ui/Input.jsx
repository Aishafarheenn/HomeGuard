import React from "react";

function Input({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  className = "",
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
      className={`w-full py-3 px-4 mb-4 
                  rounded-lg 
                  border border-gray-300 
                  outline-none 
                  focus:ring-2 focus:ring-black 
                  focus:border-black 
                  transition duration-200 
                  ${className}`}
    />
  );
}

export default Input;
