import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Electron 또는 웹 환경에서 주입된 설정을 읽어옵니다.
// 설정이 없을 경우를 대비해 더미 데이터를 기본값으로 사용합니다.
const firebaseConfig = JSON.parse(
  typeof __firebase_config !== 'undefined' 
    ? __firebase_config 
    : '{"projectId":"dummy-project"}'
);

// 앱 초기화
const app = initializeApp(firebaseConfig);

// 💡 여기서 'export const'를 사용하여 외부에서 가져갈 수 있게 합니다.
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// 필요할 경우 app 객체 자체도 내보냅니다.
export default app;