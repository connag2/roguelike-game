import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Vercel에 등록한 환경 변수를 가져옵니다.
const configRaw = import.meta.env.VITE_FIREBASE_CONFIG;

// 2. 환경 변수가 없을 때를 대비한 안전 장치 (로컬 테스트용)
const firebaseConfig = configRaw 
  ? JSON.parse(configRaw) 
  : {
      apiKey: "AIzaSyDPAr0pTocoFTQzQ3L0GRYuVcrpkgy_Eds", // 여기에 직접 넣어도 되지만 Vercel 변수가 우선입니다.
      authDomain: "roguelike-game-9a094.firebaseapp.com",
      projectId: "roguelike-game-9a094",
      storageBucket: "roguelike-game-9a094.firebasestorage.app",
      messagingSenderId: "346376142870",
      appId: "1:346376142870:web:5e850ee9078e66aa873537"
    };

// 3. Firebase 초기화
const app = initializeApp(firebaseConfig);

// 4. 외부에서 사용할 수 있게 export (App.jsx에서 사용함)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = "roguelike-game-9a094"; 

export default app;