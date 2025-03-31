import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Against Engine | Chess Game",
  description: "Play chess against the server engine. Test your skills against varying difficulty levels.",
};

export default function EngineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
