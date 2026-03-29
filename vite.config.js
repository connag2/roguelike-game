import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel(웹 환경)일 때는 '/' 사용, 데스크탑(EXE) 빌드일 때는 './' 사용
  base: process.env.VERCEL ? '/' : './', 
})