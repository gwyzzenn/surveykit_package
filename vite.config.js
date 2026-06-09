import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'SurveyKit',
      formats: ['es', 'umd'],
      fileName: (format) => `survey-kit.${format}.js`
    },
    rollupOptions: {
      output: {
        assetFileNames: 'survey-kit.[ext]',
        exports: 'named'
      }
    }
  }
})
