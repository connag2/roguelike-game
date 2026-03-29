import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 💡 Vercel 빌드 멈춤(gzip 계산) 현상을 완벽하게 해결하는 핵심 옵션!
    reportCompressedSize: false, 
    chunkSizeWarningLimit: 1500, // 용량 경고 기준을 높여서 빌드 안정화
  }
})