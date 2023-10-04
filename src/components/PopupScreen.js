import React, { useState } from "react";

const PopupScreen = ({ onClose }) => {
  const [result, setResult] = useState("");

  const handleClose = () => {
    onClose(result);
  };

  return (
    <div>
      <label> Usuario: 
      <input type="text" value={result} onChange={(e) => setResult(e.target.value)} />
      <button onClick={handleClose}>Close</button>
      </label>
    </div>
  );
};

export default PopupScreen;