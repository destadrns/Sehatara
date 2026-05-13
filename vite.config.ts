import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleGeminiSymptomAnalysis } from './geminiSymptomServer.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), geminiDevProxy(env)],
  }
})

function geminiDevProxy(env: Record<string, string>) {
  return {
    name: 'sehatara-gemini-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/gemini/symptom-analysis', (req, res) => {
        void handleGeminiSymptomAnalysis(req, res, env)
      })
    },
  }
}
