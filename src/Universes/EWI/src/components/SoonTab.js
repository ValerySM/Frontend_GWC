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
    <div className="soon-tab">
      <h2>Referral System</h2>
      <div>
        <h3>Your Referral Link</h3>
        <p>{referralLink}</p>
        <button onClick={copyToClipboard}>Copy Link</button>
        <p>Share this link with your friends to earn bonuses!</p>
      </div>
      {referralStats && (
        <div>
          <h3>Your Referral Stats</h3>
          <p>Referrals: {referralStats.referrals_count}</p>
        </div>
      )}
    </div>
  );
}

export default SoonTab;