// src/utils/backgroundWorker.js
// 브라우저 탭이 비활성화되거나 최소화되어도 타이머가 중단되지 않도록 Web Worker를 활용한 백그라운드 틱 제공

let workerInstance = null;
let fallbackInterval = null;
const tickListeners = new Set();

const dispatchTick = () => {
  tickListeners.forEach(cb => {
    try { cb(); } catch (err) { /* ignore */ }
  });
};

export const getBackgroundWorker = () => {
  if (typeof window === 'undefined') return null;
  if (!workerInstance && typeof Worker !== 'undefined') {
    try {
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'start') {
            if (!timer) {
              timer = setInterval(function() {
                self.postMessage('tick');
              }, 120);
            }
          } else if (e.data === 'stop') {
            if (timer) {
              clearInterval(timer);
              timer = null;
            }
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      workerInstance = new Worker(URL.createObjectURL(blob));
      workerInstance.onmessage = () => {
        dispatchTick();
      };
      workerInstance.postMessage('start');
    } catch (e) {
      console.warn('Web Worker background timer initialization skipped', e);
    }
  }

  if (!workerInstance && !fallbackInterval) {
    fallbackInterval = setInterval(dispatchTick, 120);
  }

  return workerInstance;
};

export const subscribeBackgroundTick = (callback) => {
  tickListeners.add(callback);
  getBackgroundWorker();
  return () => {
    tickListeners.delete(callback);
  };
};
