import type { Metadata } from "next";

import { Providers } from "@/components/providers";

import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
	title: "TikZLab",
	description: "A modern LaTeX editor focused on TikZ diagrams.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn("h-full antialiased", "font-sans", geist.variable)}
		>
			<body className="min-h-full bg-background text-foreground">
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
