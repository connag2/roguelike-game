// src/config/firebase.js

// 여기에 본인의 실제 Firebase 콘솔에서 복사한 설정값을 넣으세요.
// 만약 이 값을 모른다면 이전에 잘 작동하던 App.jsx 상단에 있던 firebaseConfig 내용을 그대로 가져오면 됩니다.
const firebaseConfig = {
  apiKey: "본인의_API_KEY",
  authDomain: "본인의_PROJECT_ID.firebaseapp.com",
  projectId: "본인의_PROJECT_ID",
  storageBucket: "본인의_PROJECT_ID.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

// ... 이하 initializeApp 로직은 동일