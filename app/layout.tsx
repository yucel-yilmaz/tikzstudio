import type { Metadata } from "next";

import { Providers } from "@/components/providers";

import "./globals.css";
import { Geist } from "next/font/google";
import { getMessages } from "@/lib/i18n/messages";
import { getI18n, getLocale } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
	const { t } = await getI18n();
	return {
		title: "TikZ Studio",
		description: t("meta.description"),
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();

	return (
		<html
			lang={locale}
			className={cn("h-full antialiased", "font-sans", geist.variable)}
		>
			<body className="min-h-full bg-background text-foreground">
				<Providers locale={locale} messages={getMessages(locale)}>
					{children}
				</Providers>
			</body>
		</html>
	);
}
