import React, { useState } from "react";
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
    <div style={styles.container}>
      <Card>
        {/* Black Top Section */}
        <div style={styles.topSection}>
          <h2 style={{ color: "white" }}>Owner Registration</h2>
        </div>

        {/* White Bottom Section */}
        <div style={styles.bottomSection}>
          <form onSubmit={handleSubmit}>

            <label style={styles.label}>Full Name</label>
            <Input
              type="text"
              name="fullName"
              placeholder="Enter full name"
              value={formData.fullName}
              onChange={handleChange}
            />

            <label style={styles.label}>E-mail</label>
            <Input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />

            <label style={styles.label}>Phone</label>
            <Input
              type="tel"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
            />

            <label style={styles.label}>Address</label>
            <Input
              type="text"
              name="address"
              placeholder="Enter address"
              value={formData.address}
              onChange={handleChange}
            />

            <label style={styles.label}>Password</label>
            <Input
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
            />

            <label style={styles.label}>Confirm Password</label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <Button type="submit">Register Owner</Button>
          </form>

          <p style={styles.loginText}>
            Already have an account?{" "}
            <span style={styles.loginLink}>Login</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f2f2f2",
    padding: "20px",
  },
  topSection: {
    background: "black",
    height: "120px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomRightRadius: "60px",
  },
  bottomSection: {
    padding: "30px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
  },
  loginText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
  },
  loginLink: {
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default OwnerRegistration;
