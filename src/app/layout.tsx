import { ThemeProvider } from "@/context/ThemeContext";
import NavBar from "./components/Global/NavBar";
import CustomFooter from "./components/Global/CustomFooter";
import ScrollToTop from "./components/LandingPage/ScrollToTop";
import GradientBackground from "./components/Global/GradientBackground";

// Wrap your root layout with ThemeProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <NavBar></NavBar>
          {children}
          <ScrollToTop />
          <CustomFooter></CustomFooter>
          <GradientBackground />
        </ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Gambit.pl",
  description: "Motorola Science Cup 2025 Project",
};
