declare module '*.vue' {
  import type { ComponentOptions } from 'vue'

  const comp: ComponentOptions
  export default comp
}

interface Window {
  zaraz?: {
    track: (event: string, properties: Record<string, string>) => void
  }
}
