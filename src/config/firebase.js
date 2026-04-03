import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const configRaw = import.meta.env.VITE_FIREBASE_CONFIG;

// 1. 기본 설정 (환경 변수 파싱 실패 시 대비)
let firebaseConfig = {
  apiKey: "AIzaSyDPAr0pTocoFTQzQ3L0GRYuVcrpkgy_Eds",
  authDomain: "roguelike-game-9a094.firebaseapp.com",
  projectId: "roguelike-game-9a094",
  storageBucket: "roguelike-game-9a094.firebasestorage.app",
  messagingSenderId: "346376142870",
  appId: "1:346376142870:web:5e850ee9078e66aa873537"
};

// 2. 환경 변수가 있으면 덮어쓰기되, 에러 발생 시 앱이 죽지 않도록 방어
if (configRaw) {
  try {
    firebaseConfig = JSON.parse(configRaw);
  } catch (error) {
    console.error("Firebase 환경변수 파싱 에러 (기본값으로 실행합니다):", error);
  }
}

// 3. Firebase 초기화
const app = initializeApp(firebaseConfig);

// 4. 외부에서 사용할 수 있게 export
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "roguelike-game-9a094"; 

export default app; 