import { type Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}", // include shadcn UI
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
