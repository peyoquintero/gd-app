import React, { useState } from "react";


const PopupScreen = ({ onClose }) => {
  const [result, setResult] = useState("");

  const handleClose = () => {
    onClose(result);
  };

  return (
    <div className="containerPp">
      <h2 style={{textAlign: 'center'}}>Inicio de sesión</h2>
        <label style={{marginRight: '200px', fontSize: '14px'}} >Usuario:</label>
        <input type="text" placeholder="Ingresa tu usuario" value={result} onChange={(e) => setResult(e.target.value)} />
        <button style={{ margin: 'auto', width: '270px',  height: '35px', fontSize: '14px' }} onClick={handleClose}>Cerrar</button>
    </div>
  );
};

export default PopupScreen;


