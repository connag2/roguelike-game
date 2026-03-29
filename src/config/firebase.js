import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Electron이나 브라우저 환경에서 주입된 설정을 읽어옵니다.
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' 
    ? __firebase_config 
    : '{"projectId":"dummy"}'
);

let app, auth, db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase 초기화 에러:", e);
}

export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
export { app, auth, db };