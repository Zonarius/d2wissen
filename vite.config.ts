import { PluginOption, defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';
import * as fs from 'fs';

function binaryLoader(): PluginOption {
  return {
    name: "binary-loader",
    transform(src, id) {
      const [path, query] = id.split('?');
      if (query !== "bin") {
        return null;
      }
      const file = fs.readFileSync(path);
      return `export default Uint8Array.from([${file.join(",")}])`
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [binaryLoader(), react()],
  base: '/d2wissen/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
