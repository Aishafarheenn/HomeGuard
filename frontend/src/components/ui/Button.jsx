import React from "react";

function Button({ children, type }) {
  return (
    <button type={type} style={styles.button}>
      {children}
    </button>
  );
}

const styles = {
  button: {
    width: "100%",
    padding: "12px",
    background: "black",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default Button;
