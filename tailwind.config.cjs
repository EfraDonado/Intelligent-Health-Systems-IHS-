module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#F5F9FF",
        panel: "#FFFFFF",
        accent: "#2563EB",
        accent2: "#22C55E",
        ink: "#0F172A",
        muted: "#5B6B82",
        border: "rgba(148, 163, 184, 0.35)",
      },
      boxShadow: {
        soft: "0 12px 30px -20px rgba(15, 23, 42, 0.18)",
        glow: "0 0 0 1px rgba(37, 99, 235, 0.18), 0 18px 40px -28px rgba(37, 99, 235, 0.4)",
      },
      borderRadius: {
        card: "14px",
      },
      backgroundImage: {
        "mesh":
          "radial-gradient(1200px 500px at 10% -10%, rgba(59, 130, 246, 0.18), transparent 55%), radial-gradient(800px 420px at 90% 0%, rgba(34, 197, 94, 0.12), transparent 55%)",
      },
    },
  },
  plugins: [],
};
