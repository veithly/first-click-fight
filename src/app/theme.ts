import { createTheme, type MantineColorsTuple } from "@mantine/core";

const fcfBlue: MantineColorsTuple = [
  "#e7f5fb",
  "#d3e8f1",
  "#a9cfe0",
  "#7cb5cf",
  "#57a0c1",
  "#2f8cb6",
  "#176b8f",
  "#14617f",
  "#0f5068",
  "#0a3f52",
];

const fcfRed: MantineColorsTuple = [
  "#fbeae8",
  "#f3d6d3",
  "#e6a9a3",
  "#d97a71",
  "#cf5346",
  "#ca3e30",
  "#c7352e",
  "#b12a24",
  "#8f201b",
  "#6d1813",
];

export const theme = createTheme({
  fontFamily: "var(--font-body), system-ui, sans-serif",
  fontFamilyMonospace: "var(--font-mono), ui-monospace, monospace",
  headings: { fontFamily: "var(--font-display), sans-serif" },
  defaultRadius: "xs",
  primaryColor: "fcf-blue",
  primaryShade: 6,
  colors: {
    "fcf-blue": fcfBlue,
    "fcf-red": fcfRed,
  },
});
