"use client";

import { FileCode2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type TemplateThumbnailProps = {
	src: string | null | undefined;
	title: string;
	className?: string;
};

/**
 * 4:3 preview image of a template. Falls back to an icon when the template
 * has no preview yet or the image cannot be loaded.
 */
export function TemplateThumbnail({
	src,
	title,
	className,
}: TemplateThumbnailProps) {
	const [failed, setFailed] = useState(false);
	const showImage = Boolean(src) && !failed;

	return (
		<div
			className={cn(
				"relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-(--line) bg-white",
				className,
			)}
		>
			{showImage ? (
				// biome-ignore lint/performance/noImgElement: small static/user previews; next/image adds no value here
				<img
					src={src ?? undefined}
					alt={`${title} önizlemesi`}
					loading="lazy"
					decoding="async"
					onError={() => setFailed(true)}
					className="h-full w-full object-contain"
				/>
			) : (
				<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
					<FileCode2 className="size-6" />
					<span className="text-[11px]">Önizleme yok</span>
				</div>
			)}
		</div>
	);
}
