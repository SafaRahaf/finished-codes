/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // font setup
      fontSize: {
        48: ["48px", "64px"],
        36: ["36px", "48px"],
        30: ["30px", "42px"],
        20: ["20px", "32px"],
        18: ["18px", "30px"],
        16: ["16px", "26px"],
        14: ["14px", "22px"],
        12: ["12px", "18px"],
        10: ["10px", "16px"],
      },
      // app color setup
      colors: {
        // black color setup
        mblack: {
          default: "#000000",
          20: "#CCCCCC",
          30: "#B2B2B2",
          40: "#999999",
          50: "#808080",
          60: "#666666",
          70: "#4D4D4D",
          80: "#333333",
          90: "#1A1A1A",
          100: "#CCCCCC",
        },
        // main app colors
        primary: {
          // brand color setup
          brand: {
            default: "#22252B",
            100: "#E5E6EA",
            200: "#C9CDD5",
            300: "#AEB4BF",
            400: "#959BAA",
            500: "#798296",
            600: "#626A7C",
            700: "#4D5361",
            800: "#373C46",
            900: "#22252B",
          },
        },
        // accent colors
        accenta: "#E7F7FF",
        accentb: "#B6BFF0",
        // others
        tertiary: {
          1: "#7F669D",
          2: "#7895B2",
          3: "#7D6E83",
          4: "#90C8AC",
          5: "#9CB4CC",
          6: "#C3B091",
        },
        danger: {
          50: "#FEE7E7",
          100: "#FDCFCF",
          300: "#FC9F9F",
          500: "#F95656",
          700: "#D80808",
        },
        warning: {
          50: "#FFF3E7",
          100: "#FEE1C0",
          300: "#FEC98D",
          500: "#FDAE51",
          700: "#DC7803",
        },
        success: {
          50: "#E3FBE5",
          100: "#C6F8CB",
          300: "#98F3A1",
          500: "#60EC6E",
          700: "#18C629",
        },
      },
    },
  },
  plugins: [],
};
