import React, { useState, useEffect } from 'react';
import '../css.components/SoonTab.css';

function SoonTab({ userData }) {
  const [referralLink, setReferralLink] = useState('');
  const [referralStats, setReferralStats] = useState(null);

  useEffect(() => {
    fetchReferralLink();
    fetchReferralStats();
  }, []);

  const fetchReferralLink = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_referral_link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.telegram_id }),
      });
      const data = await response.json();
      setReferralLink(data.referral_link);
    } catch (error) {
      console.error('Error fetching referral link:', error);
    }
  };

  const fetchReferralStats = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/get_referral_stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userData.telegram_id }),
      });
      const data = await response.json();
      setReferralStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Referral link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="ref"> {/* Изменено на ваш класс */}
      <h2 className='ref_h'>Referral System</h2>
      <div className='ref_link'>{referralLink}</div> 
      <button className='ref_btn' onClick={copyToClipboard}>Copy Link</button> {/* Добавлен класс */}
      <div className='ref_line'>
        <span className='ref_enemy'>Your referrals:</span>
        {referralStats && <span className='ref_reward'>{referralStats.referrals_count}</span>}
      </div>
    </div>
  );
}

export default SoonTab;
