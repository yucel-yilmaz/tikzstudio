"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export function CodeBlock({ code, title }: { code: string; title?: string }) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = window.setTimeout(() => setCopied(false), 1800);
		return () => window.clearTimeout(timer);
	}, [copied]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
		} catch {
			// Clipboard can be blocked (insecure origin, permissions); ignore.
		}
	}

	return (
		<figure className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#15120f] text-[#f7f2e8] shadow-[0_18px_40px_rgba(20,16,12,0.16)]">
			<figcaption className="flex items-center justify-between gap-3 border-b border-[#2a231d] px-4 py-2">
				<span className="truncate font-mono text-xs text-[#c9bca7]">
					{title ?? "LaTeX"}
				</span>
				<Button
					type="button"
					variant="ghost"
					size="xs"
					onClick={copy}
					className="text-[#d7c9b5] hover:bg-[#2a231d] hover:text-[#f7f2e8]"
					aria-label={copied ? "Kopyalandı" : "Kodu kopyala"}
				>
					{copied ? <Check /> : <Copy />}
					{copied ? "Kopyalandı" : "Kopyala"}
				</Button>
			</figcaption>
			<pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-[#f8edd6]">
				<code>{code}</code>
			</pre>
		</figure>
	);
}
