import React, { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Login() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert("Login Successful!");
  };

  return (
    <div style={styles.container}>
      <Card>
        {/* Black Top Section */}
        <div style={styles.topSection}>
          <div style={styles.icon}>👤</div>
        </div>

        {/* White Bottom Section */}
        <div style={styles.bottomSection}>
          <h2 style={styles.title}>Login</h2>

          <form onSubmit={handleSubmit}>
            <label style={styles.label}>E-mail</label>
            <Input
              type="email"
              name="email"
              placeholder="hello@dream.com"
              value={formData.email}
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

            <div style={styles.forgot}>Forgot Password?</div>

            <Button type="submit">Login</Button>
          </form>

          <p style={styles.signupText}>
            Don’t have an account? <span style={styles.signupLink}>Sign Up</span>
          </p>
        </div>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f2f2f2",
  },
  topSection: {
    background: "black",
    height: "140px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: "60px",
  },
  icon: {
    fontSize: "50px",
    color: "white",
  },
  bottomSection: {
    padding: "30px",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
  },
  forgot: {
    textAlign: "right",
    fontSize: "12px",
    marginBottom: "15px",
    cursor: "pointer",
    color: "gray",
  },
  signupText: {
    textAlign: "center",
    marginTop: "15px",
    fontSize: "14px",
  },
  signupLink: {
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Login;
