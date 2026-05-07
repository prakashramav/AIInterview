import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "InterviewAI - Master Technical Interviews & English Fluency",
  description: "The all-in-one platform to land your dream job. Adaptive technical interviews combined with a 60-Day AI English Communication Program.",
  openGraph: {
    title: "InterviewAI - AI-Powered Mock Interviews",
    description: "Practice your interview skills with an adaptive AI interviewer.",
    images: ["/og-image.png"], // Placeholder path
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI - AI-Powered Mock Interviews",
    description: "Practice your interview skills with an adaptive AI interviewer.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
