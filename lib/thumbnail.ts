import sharp from "sharp";

/** Thumbnail box used for template previews (4:3). */
export const THUMBNAIL_WIDTH = 480;
export const THUMBNAIL_HEIGHT = 360;
const PADDING = 16;
const PAGE_MIN_WIDTH_PX = 2000;

/**
 * Turns a full-size compile PNG (300 DPI) into a small 4:3 template preview.
 * - Portrait pages (A4/Letter documents) are scaled to the full width and
 *   cropped to their top part, so headings stay legible.
 * - Everything else (figures, slides) is fitted inside the box with padding
 *   and centred on white.
 */
export async function makeThumbnail(png: Buffer): Promise<Buffer> {
	const source = sharp(png).flatten({ background: "#ffffff" });
	const { width = 1, height = 1 } = await sharp(png).metadata();
	// Only real pages are cropped: at 300 DPI an A4/Letter page is ~2500 px
	// wide, while standalone figures (even tall ones) are much narrower.
	const isPortraitPage = width >= PAGE_MIN_WIDTH_PX && height / width > 1.2;

	let content: Buffer;
	if (isPortraitPage) {
		const scaled = await source
			.resize({ width: THUMBNAIL_WIDTH })
			.toBuffer({ resolveWithObject: true });
		content = await sharp(scaled.data)
			.extract({
				left: 0,
				top: 0,
				width: scaled.info.width,
				height: Math.min(THUMBNAIL_HEIGHT, scaled.info.height),
			})
			.toBuffer();
	} else {
		content = await source
			.resize({
				width: THUMBNAIL_WIDTH - 2 * PADDING,
				height: THUMBNAIL_HEIGHT - 2 * PADDING,
				fit: "inside",
			})
			.toBuffer();
	}

	return sharp({
		create: {
			width: THUMBNAIL_WIDTH,
			height: THUMBNAIL_HEIGHT,
			channels: 3,
			background: "#ffffff",
		},
	})
		.composite([
			{ input: content, gravity: isPortraitPage ? "north" : "centre" },
		])
		.png({ palette: true, quality: 90, effort: 10 })
		.toBuffer();
}
