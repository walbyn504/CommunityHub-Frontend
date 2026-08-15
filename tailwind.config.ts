import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',
          accent: '#38bdf8'
        }
      }
    }
  }
}
