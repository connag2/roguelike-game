// src/utils/backgroundAudioKeepAlive.js
// Chrome/Edge 및 Electron 환경에서 창/탭이 백그라운드로 전환될 때 브라우저 엔진이
// 타이머를 동결하거나 탭을 절전(Sleep/Discard) 모드로 전환하는 것을 방지하기 위해
// 무음(사람 귀에 들리지 않는 극미세 게인) Web Audio 스트림을 유지합니다.

let audioCtx = null;
let isKeepAliveActive = false;

export const startAudioKeepAlive = () => {
  if (typeof window === 'undefined') return;
  if (isKeepAliveActive) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // 0.00001 볼륨의 무음 오실레이터를 연결하여 백그라운드 미디어 재생 탭으로 등록
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    gain.gain.value = 0.00001; // 무음 (브라우저의 0 볼륨 최적화 감지를 우회)
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    isKeepAliveActive = true;
  } catch (e) {
    // 오디오 컨텍스트 차단 등 예외 안전 처리
  }
};
