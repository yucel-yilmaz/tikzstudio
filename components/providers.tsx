"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n/client";
import type { Locale } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages/tr";

export function Providers({
	locale,
	messages,
	children,
}: {
	locale: Locale;
	messages: Messages;
	children: React.ReactNode;
}) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<I18nProvider locale={locale} messages={messages}>
			<QueryClientProvider client={queryClient}>
				{children}
				<Toaster richColors position="top-right" />
			</QueryClientProvider>
		</I18nProvider>
	);
}
