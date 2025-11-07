import React from 'react';
import './LoadingSpinner.css'; // Vamos criar este arquivo de CSS a seguir

/**
 * Um componente de spinner de carregamento feito com CSS puro.
 * Aceita uma prop 'size' (ex: '50px') e 'message' (ex: "Carregando...")
 */
const LoadingSpinner = ({ size = '50px', message = 'Carregando...' }) => {
  return (
    <div className="spinner-container">
      <div className="spinner" style={{ width: size, height: size }}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;