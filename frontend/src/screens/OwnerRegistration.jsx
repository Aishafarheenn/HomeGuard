import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function OwnerRegistration() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    console.log(formData);
    alert("Owner Account Created Successfully!");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f2f2f2] p-5">
      <Card>
        <div className="bg-black h-[120px] flex justify-center items-center rounded-br-[60px]">
          <h2 className="text-white">Owner Registration</h2>
        </div>

        <div className="p-[30px]">
          <form onSubmit={handleSubmit}>

            <label className="text-sm font-medium">Full Name</label>
            <Input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <label className="text-sm font-medium">E-mail</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />

            <label className="text-sm font-medium">Phone</label>
            <Input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />

            <label className="text-sm font-medium">Address</label>
            <Input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
            />

            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />

            <label className="text-sm font-medium">Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <Button type="submit">Register Owner</Button>
          </form>

          <p className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-bold cursor-pointer">Login</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default OwnerRegistration;
