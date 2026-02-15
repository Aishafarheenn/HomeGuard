import React from "react";

function Card({ children }) {
  return (
    <div style={styles.card}>
      {children}
    </div>
  );
}

const styles = {
  card: {
    width: "350px",
    borderRadius: "25px",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    background: "#fff",
  },
};

export default Card;
