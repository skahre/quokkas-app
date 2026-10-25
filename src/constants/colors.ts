// Single source of truth for the palette.
// Imported by tailwind.config.js (for className) and directly in code
// where className doesn't work (LinearGradient, StatusBar, icons, etc.).
module.exports = {
  primary: "#176B68",
  background: "#F7F7F2",
  ink: "#202827", // headings
  safe: "#3A9D6E",
  warn: "#E5A72B",
  danger: "#D64545",
  mist: {
    top: "#8FB8B8",
    mid: "#BCD3D1",
    bottom: "#F7F7F2",
  },
};
