import { prisma } from "../lib/prisma";
import type { SeedSnippet, SeedTemplate } from "./math-templates";
import {
	officialPreviewUrl,
	officialSnippets,
	officialTemplates,
} from "./official-templates";

/**
 * Idempotent seed: official (owner-less) templates and snippets are matched by
 * title / trigger and updated in place, so the script can be re-run safely
 * after adding or editing seed content.
 */
async function upsertOfficialTemplate(template: SeedTemplate) {
	const files = template.files ?? [];
	const data = {
		title: template.title,
		category: template.category,
		description: template.description,
		content: template.content ?? null,
		previewUrl: officialPreviewUrl(template),
		isOfficial: true,
	};

	// Match on the current title or a previous one, so renamed official
	// templates are updated in place instead of duplicated.
	const existing = await prisma.template.findFirst({
		where: {
			title: { in: [template.title, ...(template.previousTitles ?? [])] },
			ownerId: null,
		},
	});

	await prisma.$transaction(async (tx) => {
		const saved = existing
			? await tx.template.update({ where: { id: existing.id }, data })
			: await tx.template.create({ data });

		await tx.templateFile.deleteMany({ where: { templateId: saved.id } });
		if (files.length) {
			await tx.templateFile.createMany({
				data: files.map((file, index) => ({
					templateId: saved.id,
					path: file.path,
					content: file.content,
					isMain: file.isMain ?? index === 0,
				})),
			});
		}
	});
}

async function upsertOfficialSnippet(snippet: SeedSnippet) {
	const existing = await prisma.snippet.findFirst({
		where: { trigger: snippet.trigger, ownerId: null },
	});
	const data = {
		title: snippet.title,
		category: snippet.category,
		trigger: snippet.trigger,
		description: snippet.description ?? null,
		content: snippet.content,
	};

	if (existing) {
		await prisma.snippet.update({ where: { id: existing.id }, data });
	} else {
		await prisma.snippet.create({ data });
	}
}

async function main() {
	for (const template of officialTemplates) {
		await upsertOfficialTemplate(template);
	}

	for (const snippet of officialSnippets) {
		await upsertOfficialSnippet(snippet);
	}

	const [templateCount, snippetCount] = await Promise.all([
		prisma.template.count({ where: { ownerId: null } }),
		prisma.snippet.count({ where: { ownerId: null } }),
	]);
	console.log(
		`Seed complete: ${templateCount} official templates, ${snippetCount} official snippets.`,
	);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
