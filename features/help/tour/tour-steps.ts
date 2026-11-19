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
	title: string;
	/** Supports the help-center inline syntax (`code`, **bold**). */
	body: string;
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
		title: "TikZ Studio'ya hoş geldiniz!",
		body: "Bu kısa öğretici; bir şablondan proje oluşturmayı, kodu derlemeyi ve çıktıyı indirmeyi gösterir. İstediğiniz an kapatabilir, **Yardım** menüsünden yeniden başlatabilirsiniz.",
	},
	{
		id: "yardim-menusu",
		page: "dashboard",
		target: TOUR_TARGETS.helpMenu,
		title: "Yardım her zaman burada",
		body: "**Yardım merkezi**nde motorlar, Türkçe belgeler ve sık görülen hatalar için rehberler var. Bu öğreticiyi de buradan yeniden başlatabilirsiniz.",
	},
	{
		id: "yeni-proje",
		page: "dashboard",
		target: TOUR_TARGETS.newProject,
		title: "Şablondan bir proje oluşturun",
		body: "**Yeni proje**'ye tıklayın, bir başlık yazın ve **Öğretici: İlk TikZ çiziminiz** şablonunu seçin (listede yoksa başka bir şablon da olur). **Proje oluştur**'a bastığınızda editör açılır ve öğretici orada devam eder.",
	},
	{
		id: "kod-editoru",
		page: "editor",
		target: TOUR_TARGETS.editorPane,
		title: "Kod editörü",
		body: "LaTeX ve TikZ kodunuzu buraya yazın. Yazmayı bıraktıktan yaklaşık bir saniye sonra otomatik kaydedilir. `\\` yazıp birkaç harf eklerseniz kod parçacıkları önerilir.",
	},
	{
		id: "motor",
		page: "editor",
		target: TOUR_TARGETS.engineSelect,
		title: "Motoru seçin",
		body: "**Tectonic** hızlı varsayılandır ama yalnızca hazır paketleri bilir. Bir paket bulunamazsa **pdfLaTeX**'e, kaynakça için **pdfLaTeX + Biber**'e geçin.",
	},
	{
		id: "derle",
		page: "editor",
		target: TOUR_TARGETS.compileButton,
		title: "Derleyin",
		body: "Kodunuzu PDF'e dönüştürmek için **Derle**'ye basın. Dakikada en fazla 5 derleme yapılabilir ve her derleme yaklaşık 12 saniyeyle sınırlıdır.",
	},
	{
		id: "onizleme",
		page: "editor",
		target: TOUR_TARGETS.outputPanel,
		title: "Önizleme ve Derleme günlüğü",
		body: "Derlenen PDF burada görünür; **–** ve **+** ile yakınlaştırabilirsiniz. Hata olursa **Derleme günlüğü** nedenini gösterir ve ilgili satır editörde işaretlenir. Önceki derlemeler **Geçmiş** sekmesindedir.",
	},
	{
		id: "indir",
		page: "editor",
		target: TOUR_TARGETS.outputToolbar,
		title: "PDF, SVG ve PNG indirin",
		body: "Başarılı bir derlemeden sonra bu çubukta **PDF indir**, **SVG indir** ve **PNG indir** düğmeleri belirir. PNG 300 DPI'dır; çalışma kâğıtları ve sunumlar için idealdir.",
	},
	{
		id: "paneller",
		page: "editor",
		target: TOUR_TARGETS.sidebarNav,
		title: "Dosyalar, Şablonlar ve Kod parçacıkları",
		body: "Bu simgeler **Dosyalar**, **Şablonlar**, **Kod parçacıkları** ve **Ayarlar** panellerini açar. Bir şablona tıklamak kodunu imlecin olduğu yere ekler. **Ayarlar**'dan projeyi paylaşabilir veya şablon olarak kaydedebilirsiniz.",
	},
	{
		id: "bitti",
		page: "editor",
		target: TOUR_TARGETS.helpMenu,
		title: "Hazırsınız!",
		body: "Takıldığınızda **Yardım** menüsünden yardım merkezine ulaşabilir ya da bu öğreticiyi yeniden başlatabilirsiniz. İyi çizimler!",
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
