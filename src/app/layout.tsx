import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MeaTech AI — Video Transformation Studio",
  description:
    "Transform any video with AI. Upload your source video, configure the style with Hunyuan-Video parameters, and generate stunning AI-transformed results in minutes.",
  keywords: ["AI video", "video transformation", "Hunyuan-Video", "FAL AI", "video generation"],
  authors: [{ name: "MeaTech" }],
  openGraph: {
    title: "MeaTech AI — Video Transformation Studio",
    description: "Transform any video with cutting-edge Hunyuan-Video AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
