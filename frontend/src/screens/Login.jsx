import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import {authServices} from "../services/requests/authServices";

function Login() {
  const[loading,setLoading ]=useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    setLoading(true)

    try{
      await authServices.login (formData.email , formData.password)
      alert("login completed")
    } catch (error){
      alert("login failed" )
    } finally {
      setLoading(false)
    }
  };
    
  

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <Card className="w-96 overflow-hidden shadow-xl rounded-2xl">

        {/* Black Top Section */}
        <div className="bg-black h-36 flex justify-center items-center rounded-bl-[60px]">
          <div className="text-5xl text-white">👤</div>
        </div>

        {/* White Bottom Section */}
        <div className="p-8 bg-white">
          <h2 className="text-center text-2xl font-semibold mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                name="email"
                placeholder="hello@dream.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="text-right text-xs text-gray-500 cursor-pointer hover:text-black">
              Forgot Password?
            </div>

            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>

          <p className="text-center text-sm mt-5">
            Don’t have an account?{" "}
            <Link to="/register/owner"  className="font-bold cursor-pointer hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

      </Card>
    </div>
  );
}

export default Login;
