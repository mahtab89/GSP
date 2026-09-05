import { darkColors, lightColors } from "./colors";
import { fonts } from "./fonts";

export const themeBase = {
  fonts,

  radius: {
    small: 10,
    medium: 16,
    large: 22,
    pill: 999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
} as const;
export const lightTheme = { ...themeBase, colors: lightColors } as const;

export const theme = lightTheme;

export const darkTheme = { ...themeBase, colors: darkColors } as const;

export type AppTheme = Omit<typeof lightTheme, "colors"> & {
  colors: { [Key in keyof typeof lightColors]: string };
};
