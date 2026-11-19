import { AppError } from "@/lib/errors";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/messages";
import {
	ArchiveError,
	buildProjectZip,
	planArchiveImport,
	readZip,
} from "@/lib/project-archive";
import { slugifyFilename } from "@/lib/utils";
import {
	createProjectForUser,
	requireOwnedProject,
} from "@/server/services/projects";

export async function exportProjectArchive(
	ownerId: string,
	projectId: string,
	locale: Locale = DEFAULT_LOCALE,
) {
	const project = await requireOwnedProject(ownerId, projectId);
	const fallbackName = getTranslator(locale)("projects.exportDefaultFileName");
	return {
		fileName: `${slugifyFilename(project.title) || fallbackName}.zip`,
		data: buildProjectZip(project.files),
	};
}

export async function importProjectArchive(input: {
	ownerId: string;
	archive: Uint8Array;
	title: string;
	locale?: Locale;
}) {
	try {
		const plan = planArchiveImport(
			readZip(input.archive),
			getTranslator(input.locale ?? DEFAULT_LOCALE),
		);
		const project = await createProjectForUser({
			ownerId: input.ownerId,
			title: input.title,
			files: plan.files,
		});
		return { project, warnings: plan.warnings };
	} catch (error) {
		if (error instanceof ArchiveError) {
			throw new AppError(
				"VALIDATION_ERROR",
				[error.key, error.params ?? {}],
				400,
			);
		}
		throw error;
	}
}
