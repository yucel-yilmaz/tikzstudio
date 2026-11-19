import { AppError } from "@/lib/errors";
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

export async function exportProjectArchive(ownerId: string, projectId: string) {
	const project = await requireOwnedProject(ownerId, projectId);
	return {
		fileName: `${slugifyFilename(project.title) || "tikzstudio-proje"}.zip`,
		data: buildProjectZip(project.files),
	};
}

export async function importProjectArchive(input: {
	ownerId: string;
	archive: Uint8Array;
	title: string;
}) {
	try {
		const plan = planArchiveImport(readZip(input.archive));
		const project = await createProjectForUser({
			ownerId: input.ownerId,
			title: input.title,
			files: plan.files,
		});
		return { project, warnings: plan.warnings };
	} catch (error) {
		if (error instanceof ArchiveError) {
			throw new AppError("VALIDATION_ERROR", error.message, 400);
		}
		throw error;
	}
}
