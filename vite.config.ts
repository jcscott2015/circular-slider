import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/components/CircularSlider.tsx",
      name: "CircularSlider",
      fileName: (format) => `circular-slider.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom", "clsx", "uuid"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          clsx: "clsx",
          uuid: "uuid",
        },
      },
    },
  },
});
