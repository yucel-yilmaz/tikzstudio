import type { MessageKey } from "@/lib/i18n/translate";

export type TourPage = "dashboard" | "editor";

export type TourStep = {
	id: string;
	page: TourPage;
	/**
	 * Value of the `data-tour` attribute to highlight. When it is missing or no
	 * matching element is visible (e.g. mobile layout), the card is shown in
	 * the middle of the screen instead, so the tour never gets stuck.
	 */
	target?: string;
	/** Dictionary key of the card title. */
	title: MessageKey;
	/** Dictionary key of the body; supports the help-center inline syntax (`code`, **bold**). */
	body: MessageKey;
};

/**
 * Elements the tour points at. Components mark them with
 * `data-tour={TOUR_TARGETS.x}` so renaming a class or label never breaks it.
 */
export const TOUR_TARGETS = {
	helpMenu: "help-menu",
	newProject: "new-project",
	editorPane: "editor-pane",
	engineSelect: "engine-select",
	compileButton: "compile-button",
	outputPanel: "output-panel",
	outputToolbar: "output-toolbar",
	sidebarNav: "sidebar-nav",
} as const;

export const TOUR_STEPS: TourStep[] = [
	{
		id: "hos-geldiniz",
		page: "dashboard",
		title: "tour.steps.welcomeTitle",
		body: "tour.steps.welcomeBody",
	},
	{
		id: "yardim-menusu",
		page: "dashboard",
		target: TOUR_TARGETS.helpMenu,
		title: "tour.steps.helpMenuTitle",
		body: "tour.steps.helpMenuBody",
	},
	{
		id: "yeni-proje",
		page: "dashboard",
		target: TOUR_TARGETS.newProject,
		title: "tour.steps.newProjectTitle",
		body: "tour.steps.newProjectBody",
	},
	{
		id: "kod-editoru",
		page: "editor",
		target: TOUR_TARGETS.editorPane,
		title: "tour.steps.codeEditorTitle",
		body: "tour.steps.codeEditorBody",
	},
	{
		id: "motor",
		page: "editor",
		target: TOUR_TARGETS.engineSelect,
		title: "tour.steps.engineTitle",
		body: "tour.steps.engineBody",
	},
	{
		id: "derle",
		page: "editor",
		target: TOUR_TARGETS.compileButton,
		title: "tour.steps.compileTitle",
		body: "tour.steps.compileBody",
	},
	{
		id: "onizleme",
		page: "editor",
		target: TOUR_TARGETS.outputPanel,
		title: "tour.steps.previewTitle",
		body: "tour.steps.previewBody",
	},
	{
		id: "indir",
		page: "editor",
		target: TOUR_TARGETS.outputToolbar,
		title: "tour.steps.downloadTitle",
		body: "tour.steps.downloadBody",
	},
	{
		id: "paneller",
		page: "editor",
		target: TOUR_TARGETS.sidebarNav,
		title: "tour.steps.panelsTitle",
		body: "tour.steps.panelsBody",
	},
	{
		id: "bitti",
		page: "editor",
		target: TOUR_TARGETS.helpMenu,
		title: "tour.steps.doneTitle",
		body: "tour.steps.doneBody",
	},
];

export function firstStepOf(page: TourPage): TourStep {
	const step = TOUR_STEPS.find((candidate) => candidate.page === page);
	if (!step) throw new Error(`No tour steps for page "${page}"`);
	return step;
}

export function getStepIndex(stepId: string): number {
	return TOUR_STEPS.findIndex((step) => step.id === stepId);
}
