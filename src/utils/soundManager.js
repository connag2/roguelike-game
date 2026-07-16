// src/utils/soundManager.js

class SoundManager {
  constructor() {
    this.bgmAudio = new Audio();
    this.bgmAudio.loop = true;
    
    // 저장된 설정 불러오기 (기본값 0.5)
    this.bgmVolume = parseFloat(localStorage.getItem('bgmVolume') || '0.5');
    this.sfxVolume = parseFloat(localStorage.getItem('sfxVolume') || '0.7');
    this.isMuted = localStorage.getItem('isMuted') === 'true';
    
    this.bgmAudio.volume = this.bgmVolume;
  }

  // BGM 볼륨 조절
  setBGMVolume(volume) {
    this.bgmVolume = volume;
    this.bgmAudio.volume = volume;
    localStorage.setItem('bgmVolume', volume);
  }

  // SFX 볼륨 조절
  setSFXVolume(volume) {
    this.sfxVolume = volume;
    localStorage.setItem('sfxVolume', volume);
  }

  playBGM(trackName) {
    if (!trackName) {
      this.bgmAudio.pause();
      return;
    }
    const src = `/sounds/bgm/${trackName}.mp3`;
    if (this.bgmAudio.src.endsWith(src)) return;

    this.bgmAudio.src = src;
    this.bgmAudio.volume = this.bgmVolume; // 현재 볼륨 적용
    
    if (!this.isMuted) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  playSFX(soundName) {
    if (this.isMuted) return;
    const sound = new Audio(`/sounds/sfx/${soundName}.mp3`);
    sound.volume = this.sfxVolume; // 현재 설정된 SFX 볼륨 적용
    sound.play().catch(() => {});
  }
}

export const soundManager = new SoundManager();