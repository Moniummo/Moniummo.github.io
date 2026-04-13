import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes";

// This thin wrapper keeps theme configuration in one place for the app.
const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
};

export { ThemeProvider };
