import React from 'react';
import '../comp.css/Score.css'
function Score({ tokens }) {
  return (
    <div className="Score">
      <h2 className='tokens'>EWE : {tokens}</h2>
    </div>
  );
}

export default Score;
