import React, { useState, useEffect } from "react";

const Popup = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const savedUserName = localStorage.getItem("usuario");

    if (savedUserName) {
      setUserName(savedUserName);
    }
  }, []);

  const handleSubmit = () => {
    localStorage.setItem("usuario", userName);

    // Close the popup.
    window.close();
  };

  return (
    <div>
      <h1>Enter your name:</h1>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default Popup;
