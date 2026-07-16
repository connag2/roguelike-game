// src/hooks/useAudio.js
import { useCallback } from 'react';
import { soundManager } from '../utils/soundManager';

export const useAudio = () => {
  const playBGM = useCallback((trackName) => soundManager.playBGM(trackName), []);
  const playSFX = useCallback((soundName) => soundManager.playSFX(soundName), []);
  
  // 볼륨 변경 함수 노출
  const changeBGMVolume = useCallback((val) => soundManager.setBGMVolume(val), []);
  const changeSFXVolume = useCallback((val) => soundManager.setSFXVolume(val), []);

  return { 
    playBGM, 
    playSFX, 
    changeBGMVolume, 
    changeSFXVolume,
    currentBGMVolume: soundManager.bgmVolume,
    currentSFXVolume: soundManager.sfxVolume
  };
};