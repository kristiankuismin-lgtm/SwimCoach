/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pk: "#3B82F6",   // Perus kestävyys — sininen
        vk: "#22C55E",   // Vauhtikestävyys — vihreä
        mk: "#EAB308",   // Matkakestävyys — keltainen
        mak: "#EF4444",  // Maksimikestävyys — punainen
        brand: "#0EA5E9"
      }
    }
  },
  plugins: []
}
