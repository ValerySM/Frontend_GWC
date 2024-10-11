// state.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export const AppStateProvider = ({ children }) => {
  const [totalClicks, setTotalClicks] = useState(() => JSON.parse(localStorage.getItem('totalClicks')) || 100000000);
  const [energy, setEnergy] = useState(() => JSON.parse(localStorage.getItem('energy')) || 1000);
  const [energyMax, setEnergyMax] = useState(() => JSON.parse(localStorage.getItem('energyMax')) || 1000);
  const [regenRate, setRegenRate] = useState(() => JSON.parse(localStorage.getItem('regenRate')) || 1);
  const [damageLevel, setDamageLevel] = useState(() => JSON.parse(localStorage.getItem('damageLevel')) || 1);
  const [energyLevel, setEnergyLevel] = useState(() => JSON.parse(localStorage.getItem('energyLevel')) || 1);
  const [regenLevel, setRegenLevel] = useState(() => JSON.parse(localStorage.getItem('regenLevel')) || 1);
  
  // Новые состояния для Apple Catcher
  const [appleGameHighScore, setAppleGameHighScore] = useState(() => JSON.parse(localStorage.getItem('appleGameHighScore')) || 0);
  const [appleGamePlayed, setAppleGamePlayed] = useState(() => JSON.parse(localStorage.getItem('appleGamePlayed')) || 0);

  const value = {
    totalClicks, setTotalClicks,
    energy, setEnergy,
    energyMax, setEnergyMax,
    regenRate, setRegenRate,
    damageLevel, setDamageLevel,
    energyLevel, setEnergyLevel,
    regenLevel, setRegenLevel,
    appleGameHighScore, setAppleGameHighScore,
    appleGamePlayed, setAppleGamePlayed
  };

  // Существующие useEffect
  useEffect(() => {
    localStorage.setItem('totalClicks', JSON.stringify(totalClicks));
  }, [totalClicks]);

  useEffect(() => {
    localStorage.setItem('energy', JSON.stringify(energy));
  }, [energy]);

  useEffect(() => {
    localStorage.setItem('energyMax', JSON.stringify(energyMax));
  }, [energyMax]);

  useEffect(() => {
    localStorage.setItem('regenRate', JSON.stringify(regenRate));
  }, [regenRate]);

  useEffect(() => {
    localStorage.setItem('damageLevel', JSON.stringify(damageLevel));
  }, [damageLevel]);

  useEffect(() => {
    localStorage.setItem('energyLevel', JSON.stringify(energyLevel));
  }, [energyLevel]);

  useEffect(() => {
    localStorage.setItem('regenLevel', JSON.stringify(regenLevel));
  }, [regenLevel]);

  // Новые useEffect для Apple Catcher
  useEffect(() => {
    localStorage.setItem('appleGameHighScore', JSON.stringify(appleGameHighScore));
  }, [appleGameHighScore]);

  useEffect(() => {
    localStorage.setItem('appleGamePlayed', JSON.stringify(appleGamePlayed));
  }, [appleGamePlayed]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);