import { Color } from "@mui/material";

export const tint = (color: Color, amount: number) => {
  const percent = Math.ceil(amount * 10) * 10;
  if (percent < 50) {
    return color[50];
  }
  if (percent < 55) {
    return color[100];
  }
  if (percent < 60) {
    return color[200];
  }
  if (percent < 65) {
    return color[300];
  }
  if (percent < 70) {
    return color[400];
  }
  if (percent < 75) {
    return color[500];
  }
  if (percent < 80) {
    return color[600];
  }
  if (percent < 85) {
    return color[700];
  }
  if (percent < 90) {
    return color[800];
  }
  if (percent < 95) {
    return color[900];
  }
};
