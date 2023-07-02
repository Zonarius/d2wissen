import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  "colorSchemes": {
    "light": {
      "palette": {}
    },
    "dark": {
      "palette": {
        "primary": {
          '50': '#fff5ec',
          '100': '#ffe9d3',
          '200': '#ffcfa5',
          '300': '#ffad6d',
          '400': '#ff7e32',
          '500': '#ff5b0a',
          '600': '#ff4000',
          '700': '#cc2b02',
          '800': '#a1220b',
          '900': '#821f0c',
        }
      }
    }
  }
})
  
export default theme;