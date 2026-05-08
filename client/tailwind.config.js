/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // theme purples
        gp_bg: "#0f0a24",
        gp_panel: "#1a123a",
        gp_panelSoft: "#22164d",
        gp_primary: "#8d5cf6",
        gp_primaryBright: "#a477ff",
        gp_text: "#e9e7ff",
        gp_muted: "#b8b1e6"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(141,92,246,.35), 0 10px 40px rgba(141,92,246,.25)"
      },
      borderRadius: {
        xl2: "1.25rem"
      }
    }
  },
  plugins: []
}
