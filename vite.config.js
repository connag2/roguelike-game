import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 이 줄을 반드시 추가해야 EXE에서 화면이 나옵니다!
})