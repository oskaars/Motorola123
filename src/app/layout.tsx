import { ThemeProvider } from "@/context/ThemeContext";

// Wrap your root layout with ThemeProvider
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

export const metadata = {
  title: "Gambit.pl",
  description: "Motorola Science Cup 2025 Project",
};
