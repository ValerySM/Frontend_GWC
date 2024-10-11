import React from 'react';
import '../comp.css/FarmButton.css';

function FarmButton({ isFarming, farmedTokens, onClick }) {
  return (
    <button
      className="FarmBtn"
      onClick={onClick}
      disabled={isFarming && farmedTokens < 32} // Деактивировать кнопку если фарминг активен и токенов меньше maxTokens
    >
      {isFarming ? (
        `FARMED : ${farmedTokens.toFixed(3)}`
      ) : (
        farmedTokens >= 32 ? `Claim : ${farmedTokens.toFixed(3)} EWE` : 'START FARMING'
      )}
    </button>
  );
}

export default FarmButton;
