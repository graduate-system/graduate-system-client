import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "must-green":       "#1a5c2a",
        "must-green-mid":   "#236e33",
        "must-green-light": "#2d8b47",
        "must-gold":        "#f5a623",
        "must-gold-dark":   "#c8841a",
      }
    }
  },
  plugins: []
};

export default config;
