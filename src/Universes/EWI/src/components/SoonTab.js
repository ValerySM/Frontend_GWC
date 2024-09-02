import React from 'react';
import '../css.components/SoonTab.css'; // Убедитесь, что файл стилей импортирован

function SoonTab() {
  return (
    <div className="soon-tab">
      <span>Coming Soon</span>
      <div className="dots">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default SoonTab;
