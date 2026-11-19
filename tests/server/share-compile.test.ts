import { beforeEach, describe, expect, it, vi } from "vitest";

const findFirst = vi.fn();

vi.mock("@/lib/prisma", () => ({
	prisma: { compileJob: { findFirst: (...args: any[]) => findFirst(...args) } },
}));
vi.mock("@/lib/pgboss", () => ({ COMPILE_QUEUE: "compile", getBoss: vi.fn() }));
vi.mock("@/server/compiler/docker-adapter", () => ({
	DockerCompilerAdapter: class {},
}));
vi.mock("@/server/compiler/storage", () => ({}));
vi.mock("@/server/services/projects", () => ({ requireOwnedProject: vi.fn() }));

const { getLatestPublicCompileOutputForProject } = await import(
	"@/server/services/compile"
);
const { GET } = await import("@/app/api/share/[projectId]/compile/route");

function callRoute(projectId: string) {
	return GET(new Request(`http://localhost/api/share/${projectId}/compile`), {
		params: Promise.resolve({ projectId }),
	});
}

const successJob = {
	id: "job-1",
	projectId: "proj-1",
	status: "SUCCESS",
	engine: "TECTONIC",
	log: "ok",
	outputUrl: "/api/compile-jobs/job-1/output",
	svgOutputUrl: "/api/compile-jobs/job-1/output?format=svg",
	pngOutputUrl: null,
	errorCode: null,
	startedAt: new Date("2026-01-01T10:00:00Z"),
	finishedAt: new Date("2026-01-01T10:00:05Z"),
	createdAt: new Date("2026-01-01T09:59:59Z"),
};

describe("public share compile lookup", () => {
	beforeEach(() => {
		findFirst.mockReset();
	});

	it("only matches successful jobs with output on public, non-deleted projects, without an owner filter", async () => {
		findFirst.mockResolvedValue(null);
		await getLatestPublicCompileOutputForProject("proj-1");

		expect(findFirst).toHaveBeenCalledTimes(1);
		const { where, orderBy } = findFirst.mock.calls[0][0];
		expect(where).toEqual({
			projectId: "proj-1",
			status: "SUCCESS",
			outputUrl: { not: null },
			project: { isPublic: true, deletedAt: null },
		});
		expect(where.project).not.toHaveProperty("ownerId");
		expect(orderBy).toEqual({ finishedAt: "desc" });
	});

	it("returns the latest job to anonymous visitors (no session needed)", async () => {
		findFirst.mockResolvedValue(successJob);

		const response = await callRoute("proj-1");

		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.compileJob).toMatchObject({
			id: "job-1",
			status: "SUCCESS",
			outputUrl: "/api/compile-jobs/job-1/output",
			svgOutputUrl: "/api/compile-jobs/job-1/output?format=svg",
			finishedAt: "2026-01-01T10:00:05.000Z",
		});
	});

	it("returns null when the project is private, deleted or never compiled", async () => {
		findFirst.mockResolvedValue(null);

		const response = await callRoute("private-proj");

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ compileJob: null });
	});
});
