/**
 * Turkish UI messages — the default language and the source of truth for
 * the dictionary shape. `en.ts` must have exactly the same keys
 * (enforced by the `Messages` type and tests/lib/i18n.test.ts).
 *
 * Placeholders: `{name}`; plurals: `{count, plural, one {…} other {…}}`
 * (`#` is the number); rich text (rendered with `rich()`): `<b>…</b>`.
 */
export const tr = {
	common: {
		cancel: "İptal",
		dismiss: "Vazgeç",
		save: "Kaydet",
		close: "Kapat",
		delete: "Sil",
		create: "Oluştur",
		new: "Yeni",
		all: "Tümü",
		allWithCount: "Tümü ({count})",
		optionWithCount: "{label} ({count})",
		title: "Başlık",
		category: "Kategori",
		content: "İçerik",
		description: "Açıklama",
		loading: "Yükleniyor…",
		saving: "Kaydediliyor…",
		deleting: "Siliniyor…",
		sending: "Gönderiliyor…",
		processing: "İşleniyor…",
		dashboard: "Panel",
		backToDashboard: "Panele dön",
		goToDashboard: "Panele git",
		home: "Ana sayfa",
		backToHome: "Ana sayfaya dön",
		signIn: "Giriş yap",
		signUp: "Hesap oluştur",
		help: "Yardım",
		helpCenter: "Yardım merkezi",
		faq: "Sıkça sorulan sorular",
		troubleshooting: "Sorun giderme",
		gettingStarted: "Başlarken",
		footerLinks: "Alt bağlantılar",
		email: "E-posta",
		emailPlaceholder: "ornek@eposta.com",
		passwordPlaceholder: "En az 8 karakter",
		requestFailed: "İstek başarısız oldu.",
		networkError: "Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.",
		unexpectedError: "Beklenmeyen bir hata oluştu",
		tryAgain: "Tekrar dene",
		noPreview: "Önizleme yok",
		previewAlt: "{title} önizlemesi",
		personalCategory: "Kişisel",
	},
	locale: {
		label: "Dil",
		switchTo: "Dili değiştir: {language}",
	},
	meta: {
		description:
			"Ödevden makaleye, ders notundan sunuma: şekil, grafik ve belgeleriniz için tarayıcıda çalışan modern TikZ ve LaTeX editörü.",
		projectNotFound: "Proje bulunamadı",
		shareDescription: "TikZ Studio ile hazırlanmış bir TikZ projesi.",
		helpTitleTemplate: "%s · TikZ Studio Yardım",
		helpDefaultTitle: "Yardım merkezi · TikZ Studio",
		helpDescription:
			"TikZ Studio yardım merkezi: başlarken, editör, derleme motorları, Türkçe belgeler, sorun giderme ve sıkça sorulan sorular.",
		notFoundTitle: "Sayfa bulunamadı · TikZ Studio",
	},
	notFound: {
		badge: "404",
		title: "Sayfa bulunamadı",
		description:
			"Aradığınız sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.",
	},
	landing: {
		tagline: "TikZ ve LaTeX için tarayıcı tabanlı çalışma alanı",
		heroTitle:
			"Şekillerinizi, grafiklerinizi ve belgelerinizi TikZ ile tarayıcıda hazırlayın.",
		heroBody:
			"Kurulum gerektirmeyen bir LaTeX editörü: kodunuzu yazın, tek tıkla derleyin, sonucu anında PDF olarak görün. Ödev, ders notu, sınav, makale, tez ve sunum için tüm işinizi tek ekranda yapın.",
		getStarted: "Hemen başla",
		highlightTemplatesTitle: "Hazır şablonlar",
		highlightTemplatesBody:
			"Lise matematiğinden makale şekillerine 30'u aşkın hazır şablonla başlayın.",
		highlightCompileTitle: "Güvenli derleme",
		highlightCompileBody:
			"5 motor: Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX, Biber.",
		highlightFormatsTitle: "PDF, SVG & PNG",
		highlightFormatsBody: "İstediğiniz biçimde, doğrudan tarayıcıdan indirin.",
		demoEditing: "Düzenleniyor",
		demoStepEditTitle: "Kodu düzenle",
		demoStepEditBody: "TikZ kodunu editör panelinde güncelleyin.",
		demoStepCompileTitle: "Derle",
		demoStepCompileBody: "PDF, yalıtılmış bir ortamda oluşturulur.",
		demoStepCheckTitle: "Kontrol et",
		demoStepCheckBody: "Sonucu önizlemeden ve derleme günlüğünden doğrulayın.",
		featureWorkspaceTitle: "Tek ekranda çalışma",
		featureWorkspaceBody:
			"Kod, derleme ve PDF/SVG/PNG çıktısı aynı çalışma alanında; ayrı programlar arasında gidip gelmenize gerek yok.",
		featureSandboxTitle: "Güvenli derleme ortamı",
		featureSandboxBody:
			"Beş motor (Tectonic, pdfLaTeX, XeLaTeX, LuaLaTeX, pdfLaTeX+Biber), ağdan yalıtılmış bir Docker ortamında çalışır.",
		featureImg2LatexTitle: "Görselden LaTeX'e",
		featureImg2LatexBody:
			"Formül fotoğraflarını Docker Model Runner, pix2tex veya Mathpix ile doğrudan editörün içinde LaTeX koduna dönüştürün.",
		featureTemplatesTitle: "Her seviyeye şablon",
		featureTemplatesBody:
			"Lise geometrisi ve fonksiyon grafiklerinden 3B yüzeylere, değişmeli diyagramlara, otomatlara, makale grafiklerine ve Beamer sunumlarına; kendi projenizi de şablon olarak kaydedin.",
		audienceBadge: "Kimler için?",
		audienceTitle:
			"Karmaşık kurulumlarla uğraşmadan kaliteli şekiller ve belgeler hazırlamak isteyen herkes için.",
		audienceBody:
			"Ödev ve proje hazırlayan lise ve üniversite öğrencileri, çalışma kâğıdı ve sınav hazırlayan öğretmenler, makale, tez ve sunumları için yayın kalitesinde şekil üreten akademisyenler — hepsi için sade ve odaklı bir TikZ ortamı.",
		quickStartTitle: "Hızlı başlangıç, baskıya hazır çıktı",
		quickStartBody:
			"İlk satırdan indirilen PDF'e kadar geçen süreyi kısaltın; şekilleriniz her zaman temiz ve tutarlı görünsün.",
	},
	auth: {
		heroTitle:
			"Şekilleriniz ve belgeleriniz için tarayıcıda çalışan TikZ editörü.",
		heroBody:
			"Kod editörü, güvenli derleme, PDF önizleme ve derleme günlüğü aynı ekranda. Ödevden makaleye, sınav kâğıdından sunuma kadar kurulum gerektirmeyen hızlı bir çalışma ortamı.",
		benefitProjects:
			"Projelerinizi kaydedin, tüm değişiklikleri tek yerden yönetin.",
		benefitCompile:
			"Güvenli ortamda derleyin, çıktıyı ve hataları anında görün.",
		benefitTemplates:
			"Şablonlar ve kod parçacıklarıyla yeni belgelere hızla başlayın.",
		signupTitle: "TikZ Studio hesabınızı oluşturun",
		loginTitle: "Çalışma alanınıza dönün",
		cardDescription:
			"TikZ projelerinizi kaydetmek, derlemek ve yönetmek için giriş yapın.",
		checkInboxTitle: "Gelen kutunuzu kontrol edin",
		checkInboxBody:
			"<b>{email}</b> adresine bir doğrulama bağlantısı gönderdik. Hesabınızı etkinleştirmek için bağlantıya tıklayın. E-posta birkaç dakika içinde gelmezse istenmeyen (spam) klasörüne bakın.",
		resent: "Yeniden gönderildi",
		resendLink: "Bağlantıyı yeniden gönder",
		fullName: "Ad soyad",
		fullNamePlaceholder: "Adınızı ve soyadınızı girin",
		password: "Şifre",
		forgotPassword: "Şifremi unuttum",
		verificationResent: "Doğrulama bağlantısı yeniden gönderildi.",
		resendVerification: "Doğrulama bağlantısını yeniden gönder",
		or: "veya",
		continueWith: "{provider} ile devam et",
		haveAccount: "Zaten hesabınız var mı?",
		newHere: "Yeni misiniz?",
		backToLogin: "Girişe dön",
		emailVerificationBadge: "E-posta doğrulama",
		verificationFailedTitle: "Doğrulama tamamlanamadı",
		verificationFailedFallback:
			"Doğrulama bağlantısı geçersiz. Giriş yapmayı deneyin; gerekirse yeni bir bağlantı gönderebilirsiniz.",
		verifiedTitle: "E-posta adresiniz doğrulandı",
		verifiedBody: "Teşekkürler! Hesabınız etkinleştirildi.",
		forgotBadge: "Şifremi unuttum",
		forgotTitle: "Şifrenizi sıfırlayın",
		forgotDescription:
			"Hesabınızın e-posta adresini girin; size yeni şifre belirlemeniz için bir bağlantı gönderelim.",
		forgotSent:
			"<b>{email}</b> adresiyle kayıtlı bir hesap varsa, şifre sıfırlama bağlantısı gönderildi. Bağlantı 1 saat geçerlidir. Birkaç dakika içinde gelmezse istenmeyen (spam) klasörüne bakın.",
		sendResetLink: "Sıfırlama bağlantısı gönder",
		resetBadge: "Şifre sıfırlama",
		resetTitle: "Yeni şifre belirleyin",
		resetDescription: "Yeni şifreniz en az 8 karakter olmalı.",
		resetInvalidFallback:
			"Bağlantı geçersiz. Lütfen yeni bir bağlantı isteyin.",
		requestNewLink: "Yeni bağlantı iste",
		resetDone:
			"Şifreniz güncellendi. Güvenliğiniz için diğer cihazlardaki oturumlarınız kapatıldı.",
		signInWithNewPassword: "Yeni şifrenizle giriş yapın",
		passwordsDoNotMatch: "Şifreler eşleşmiyor.",
		newPassword: "Yeni şifre",
		newPasswordRepeat: "Yeni şifre (tekrar)",
		updatePassword: "Şifreyi güncelle",
	},
	authErrors: {
		INVALID_EMAIL_OR_PASSWORD: "E-posta veya şifre hatalı.",
		USER_ALREADY_EXISTS: "Bu e-posta adresiyle zaten bir hesap var.",
		USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
			"Bu e-posta adresiyle zaten bir hesap var. Başka bir e-posta deneyin.",
		PASSWORD_TOO_SHORT: "Şifre en az 8 karakter olmalı.",
		PASSWORD_TOO_LONG: "Şifre çok uzun.",
		INVALID_EMAIL: "Geçerli bir e-posta adresi girin.",
		INVALID_PASSWORD: "Mevcut şifre hatalı.",
		EMAIL_NOT_VERIFIED:
			"E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki bağlantıya tıklayın.",
		INVALID_TOKEN:
			"Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
		TOKEN_EXPIRED:
			"Bağlantının süresi dolmuş. Lütfen yeni bir bağlantı isteyin.",
		EMAIL_ALREADY_VERIFIED: "E-posta adresiniz zaten doğrulanmış.",
		SESSION_EXPIRED:
			"Güvenliğiniz için bu işlemden önce çıkış yapıp yeniden giriş yapın.",
		CREDENTIAL_ACCOUNT_NOT_FOUND: "Bu hesapta şifre tanımlı değil.",
		TOO_MANY_REQUESTS:
			"Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.",
		fallback: "İşlem başarısız oldu.",
		signInFailed: "Giriş başarısız oldu.",
	},
	dashboard: {
		badge: "Panel",
		projectCount: "{count} proje",
		greeting: "Merhaba, {name}",
		intro:
			"TikZ projelerinizi yönetin, yeni belgelere başlayın ve son derleme çıktılarınızı tek yerden takip edin.",
		statProjects: "Projeler",
		statTemplates: "Şablonlar",
		statWorkflow: "Çalışma akışı",
		statWorkflowValue: "Editör + PDF + günlük",
		newProject: "Yeni proje",
		myAccount: "Hesabım",
		signOut: "Çıkış yap",
		projectsTitle: "Projeler",
		projectsDescription:
			"Projelerinizi arayın, açın veya kullanmadıklarınızı silin.",
		searchPlaceholder: "Ada veya açıklamaya göre ara",
		noDescription: "Açıklama eklenmemiş.",
		deleteProject: "Projeyi sil",
		openInEditor: "Editörde aç",
		emptyBadge: "Boş çalışma alanı",
		emptyTitle: "Henüz proje yok",
		emptyBody:
			"İlk TikZ çiziminize varsayılan belgeyle veya hazır bir şablonla başlayın.",
		createFirst: "İlk projenizi oluşturun",
		modalTitle: "Yeni bir TikZ projesi oluşturun",
		modalDescription:
			"Bir başlık ekleyin, kısa bir açıklama yazın ve başlangıç şablonunu seçin.",
		titlePlaceholder: "ör. Üçgenin iç açıları",
		descriptionPlaceholder: "Bu projede ne hazırlayacaksınız?",
		starterTemplate: "Başlangıç şablonu",
		starterTemplateHint:
			"Boş bir belgeyle başlayın veya hazır bir örnek seçip hemen editöre geçin.",
		defaultTemplate: "Varsayılan TikZ",
		defaultTemplateHint: 'Basit bir "Merhaba TikZ" belgesi',
		creating: "Oluşturuluyor…",
		createProject: "Proje oluştur",
		deleteTitle: "Proje silinsin mi?",
		deleteBody:
			"<b>{title}</b> projesi ve tüm dosyaları silinecek. Bu işlem geri alınamaz.",
	},
	account: {
		badge: "Hesabım",
		title: "Hesap ve güvenlik",
		passwordTitle: "Şifre",
		socialOnly:
			"Bu hesap GitHub veya Google ile oluşturuldu; şifre yerine o hesapla giriş yaparsınız.",
		verified: "Doğrulandı",
		notVerified: "Doğrulanmadı",
		verifyHint:
			"E-posta adresinizi doğrulamak, şifrenizi unuttuğunuzda hesabınıza yeniden ulaşabilmeniz için önemlidir.",
		verificationSent: "Doğrulama bağlantısı {email} adresine gönderildi.",
		sendVerification: "Doğrulama bağlantısı gönder",
		changePasswordTitle: "Şifre değiştir",
		changePasswordDescription:
			"Şifreniz değiştiğinde diğer cihazlardaki oturumlarınız kapatılır.",
		newPasswordsDoNotMatch: "Yeni şifreler eşleşmiyor.",
		passwordUpdated: "Şifreniz güncellendi; diğer oturumlarınız kapatıldı.",
		currentPassword: "Mevcut şifre",
		sessionsTitle: "Oturumlar",
		sessionsDescription:
			"Ortak bir bilgisayarda (ör. okul laboratuvarı) çıkış yapmayı unuttuysanız diğer tüm oturumlarınızı buradan kapatabilirsiniz.",
		sessionsRevoked: "Bu cihaz dışındaki tüm oturumlarınız kapatıldı.",
		revokeSessions: "Diğer oturumlarımı kapat",
		deleteTitle: "Hesabımı sil",
		deleteDescription:
			"Hesabınız ve bütün projeleriniz, dosyalarınız, derleme çıktılarınız ve kişisel şablonlarınız kalıcı olarak silinir. Bu işlem geri alınamaz; önce saklamak istediğiniz projeleri .zip olarak indirin.",
		confirmEmail: "Onaylamak için e-posta adresinizi yazın",
		yourPassword: "Şifreniz",
		socialDeleteHint:
			"GitHub/Google ile giriş yaptığınız için şifre istenmez; son girişiniz bir günden eskiyse önce çıkış yapıp yeniden giriş yapmanız gerekir.",
		deletePermanently: "Hesabımı kalıcı olarak sil",
		startDelete: "Hesabımı silmek istiyorum",
		languageTitle: "Dil",
		languageDescription: "Arayüzün ve size gönderilen e-postaların dili.",
	},
	compileStatus: {
		ready: "Hazır",
		pending: "Sırada",
		running: "Derleniyor…",
		success: "Başarılı",
		failed: "Başarısız",
		timeout: "Zaman aşımı",
		notCompiled: "Henüz derlenmedi",
	},
	editor: {
		saveIdle: "Kaydedildi",
		saveDirty: "Kaydedilmemiş değişiklik",
		saveSaving: "Kaydediliyor…",
		saveSaved: "Kaydedildi",
		saveError: "Kaydedilemedi",
		panelFiles: "Dosyalar",
		panelFilesDescription: "Projedeki kaynak dosyaları seçin ve açın.",
		panelTemplates: "Şablonlar",
		panelTemplatesDescription:
			"Hazır başlangıç belgelerini etkin dosyaya ekleyin.",
		panelSnippets: "Kod parçacıkları",
		panelSnippetsDescription: "Sık kullanılan TikZ bloklarını hızlıca ekleyin.",
		panelSettings: "Ayarlar",
		panelSettingsDescription:
			"Proje bilgilerini ve görünürlük ayarlarını güncelleyin.",
		engineSaveFailed: "Motor seçimi kaydedilemedi.",
		saveChangesFailed: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.",
		saveBeforeCompileFailed:
			"Değişiklikler kaydedilemedi; derleme başlatılmadı.",
		templateSaved: '"{title}" şablon olarak kaydedildi',
		templateSavedDescription:
			"Yeni proje oluştururken şablon listesinde görünür.",
		templateSaveFailed: "Şablon kaydedilemedi.",
		breadcrumbEditor: "Editör",
		projectLoading: "Proje yükleniyor…",
		closePanel: "Paneli kapat",
		openPanel: "Paneli aç",
		shareLinkCopied: "Paylaşım bağlantısı kopyalandı",
		share: "Paylaş",
		starting: "Başlatılıyor…",
		compile: "Derle",
		codeEditor: "Kod editörü",
		noActiveFile: "Etkin dosya seçilmedi",
		projectPanel: "Proje paneli",
		projectPanelMobileDescription: "Dosyalar, şablonlar ve kod parçacıkları.",
		projectPanelDescription:
			"Dosyaları, şablonları ve proje ayarlarını yönetin.",
		closeProjectPanel: "Proje panelini kapat",
		openProjectPanel: "Proje panelini aç",
		projectName: "Proje adı",
		publicReadOnly: "Herkese açık (salt okunur)",
		publicHintShort: "Paylaşım için işaretleyin",
		saveSettings: "Ayarları kaydet",
		outputPanel: "Çıktı paneli",
		outputPanelMobileDescription: "Derleme sonuçları ve PDF önizleme",
		outputPanelDescription: "Derleme durumu ve PDF önizleme",
		downloadPdf: "PDF indir",
		downloadSvg: "SVG indir",
		downloadPng: "PNG indir",
		logPlaceholder: "Derleme çıktısı burada görünecek.",
		noLogYet: "Henüz derleme çıktısı yok.",
		img2latexOpen: "Görselden LaTeX'e dönüştür",
		tabPreview: "Önizleme",
		tabHistory: "Geçmiş",
		noCompilesYet: "Henüz derleme yok.",
		engineLabel: "Motor:",
		lastCompileLabel: "Son derleme:",
		notYet: "Henüz yok",
		compileLog: "Derleme günlüğü",
		public: "Herkese açık",
		publicHint:
			"Açarsanız paylaşım bağlantısına sahip herkes projeyi görüntüleyebilir.",
	},
	fileTree: {
		newFilePlaceholder: "ornek.tex",
		newFile: "Yeni dosya",
		uploadFile: "Dosya yükle",
		main: "Ana",
		fileActions: "Dosya işlemleri",
		rename: "Yeniden adlandır",
		makeMain: "Ana dosya yap",
		confirmDelete: '"{path}" silinsin mi?',
		created: '"{path}" oluşturuldu',
		createFailed: "Dosya oluşturulamadı.",
		deleted: "Dosya silindi",
		deleteFailed: "Dosya silinemedi.",
		renamed: 'Yeni ad: "{path}"',
		renameFailed: "Dosya yeniden adlandırılamadı.",
		mainSet: '"{path}" ana dosya yapıldı',
		mainSetFailed: "Ana dosya değiştirilemedi.",
		uploaded: '"{path}" yüklendi',
		uploadFailed: "Dosya yüklenemedi.",
	},
	compile: {
		jobIdRequired: "Derleme işi kimliği gerekli.",
		startFailed: "Derleme başlatılamadı.",
	},
	templates: {
		searchPlaceholder: "Şablonlarda ara…",
		newTemplate: "Yeni şablon",
		noMatches: "Eşleşen şablon bulunamadı.",
		saveAsTemplate: "Şablon olarak kaydet",
		saveAsTemplateHint:
			"Projedeki tüm dosyalar (şekiller, görseller, stil dosyaları) yeni projelerde kullanabileceğiniz kişisel bir şablona kopyalanır. Kaydedilmemiş değişiklikler önce kaydedilir.",
		templateName: "Şablon adı",
		categoryPlaceholder: "ör. Ödev, Makale şekilleri",
	},
	snippets: {
		count: "{count} kod parçacığı",
		newSnippet: "Yeni kod parçacığı",
		triggerPlaceholder: "Tetikleyici (ör. \\daire)",
	},
	img2latex: {
		title: "Görselden LaTeX'e",
		provider: "Sağlayıcı",
		previewAlt: "Önizleme",
		dropHint:
			"Görseli buraya bırakın ya da seçmek için tıklayın (PNG, JPEG, WebP — en fazla 4 MB)",
		converting: "Dönüştürülüyor…",
		convert: "LaTeX'e dönüştür",
		failed: "Dönüştürme başarısız oldu.",
		result: "Sonuç",
		insert: "Editöre ekle",
	},
	pdf: {
		loadFailed: "PDF yüklenemedi ({status}).",
		renderFailed: "PDF görüntülenemedi.",
		pageLabel: "Sayfa {page}",
		emptyTitle: "Henüz önizleme yok",
		emptyBody: "Derleme tamamlandığında PDF burada görünecek.",
		title: "PDF önizleme",
		zoom: "Yakınlaştırma %{zoom}",
		pageCount: " · {count} sayfa",
		zoomOut: "Uzaklaştır",
		zoomIn: "Yakınlaştır",
		loading: "PDF yükleniyor…",
		truncated:
			"Önizlemede ilk {max} sayfa gösteriliyor; belgenin tamamı ({count} sayfa) için PDF'i indirin.",
	},
	projects: {
		exportTitle: "Projeyi indir",
		exportHint:
			"Tüm dosyalar (görseller dahil) tek bir .zip olarak iner; Overleaf'e veya bilgisayarınızdaki LaTeX kurulumuna aynen aktarabilirsiniz. Kaydedilmemiş değişiklikler dahil edilmez.",
		exportButton: ".zip olarak indir",
		imported: '"{title}" içe aktarıldı',
		importWarnings: "{count} uyarı: {list}",
		importedFiles: "{count} dosya yüklendi.",
		importFailed: "ZIP içe aktarılamadı.",
		importHint:
			"Overleaf'ten veya bilgisayarınızdan bir .zip projesini içe aktarın",
		importing: "İçe aktarılıyor…",
		importButton: "İçe aktar (.zip)",
		importedDefaultTitle: "İçe aktarılan proje",
		exportDefaultFileName: "tikzstudio-proje",
	},
	share: {
		notFoundTitle: "Proje bulunamadı",
		notFoundBody: "Bu proje herkese açık değil veya silinmiş olabilir.",
		forking: "Kopyalanıyor…",
		fork: "Kendi projelerime kopyala",
		lastCompile: "Son derleme: {date}",
		sourceCode: "Kaynak kod",
		fileCount: "{count} dosya",
		mainFile: "Ana dosya",
	},
	tour: {
		resumeHint: "Öğretici, bir projeyi editörde açtığınızda devam edecek.",
		progress: "Öğretici · {current} / {total}",
		close: "Öğreticiyi kapat",
		skip: "Atla",
		back: "Geri",
		finish: "Bitir",
		gotIt: "Anladım",
		next: "İleri",
		start: "Öğreticiyi başlat",
		steps: {
			welcomeTitle: "TikZ Studio'ya hoş geldiniz!",
			welcomeBody:
				"Bu kısa öğretici; bir şablondan proje oluşturmayı, kodu derlemeyi ve çıktıyı indirmeyi gösterir. İstediğiniz an kapatabilir, **Yardım** menüsünden yeniden başlatabilirsiniz.",
			helpMenuTitle: "Yardım her zaman burada",
			helpMenuBody:
				"**Yardım merkezi**nde motorlar, Türkçe belgeler ve sık görülen hatalar için rehberler var. Bu öğreticiyi de buradan yeniden başlatabilirsiniz.",
			newProjectTitle: "Şablondan bir proje oluşturun",
			newProjectBody:
				"**Yeni proje**'ye tıklayın, bir başlık yazın ve **Öğretici: İlk TikZ çiziminiz** şablonunu seçin (listede yoksa başka bir şablon da olur). **Proje oluştur**'a bastığınızda editör açılır ve öğretici orada devam eder.",
			codeEditorTitle: "Kod editörü",
			codeEditorBody:
				"LaTeX ve TikZ kodunuzu buraya yazın. Yazmayı bıraktıktan yaklaşık bir saniye sonra otomatik kaydedilir. `\\` yazıp birkaç harf eklerseniz kod parçacıkları önerilir.",
			engineTitle: "Motoru seçin",
			engineBody:
				"**Tectonic** hızlı varsayılandır ama yalnızca hazır paketleri bilir. Bir paket bulunamazsa **pdfLaTeX**'e, kaynakça için **pdfLaTeX + Biber**'e geçin.",
			compileTitle: "Derleyin",
			compileBody:
				"Kodunuzu PDF'e dönüştürmek için **Derle**'ye basın. Dakikada en fazla 5 derleme yapılabilir ve her derleme yaklaşık 12 saniyeyle sınırlıdır.",
			previewTitle: "Önizleme ve Derleme günlüğü",
			previewBody:
				"Derlenen PDF burada görünür; **–** ve **+** ile yakınlaştırabilirsiniz. Hata olursa **Derleme günlüğü** nedenini gösterir ve ilgili satır editörde işaretlenir. Önceki derlemeler **Geçmiş** sekmesindedir.",
			downloadTitle: "PDF, SVG ve PNG indirin",
			downloadBody:
				"Başarılı bir derlemeden sonra bu çubukta **PDF indir**, **SVG indir** ve **PNG indir** düğmeleri belirir. PNG 300 DPI'dır; çalışma kâğıtları ve sunumlar için idealdir.",
			panelsTitle: "Dosyalar, Şablonlar ve Kod parçacıkları",
			panelsBody:
				"Bu simgeler **Dosyalar**, **Şablonlar**, **Kod parçacıkları** ve **Ayarlar** panellerini açar. Bir şablona tıklamak kodunu imlecin olduğu yere ekler. **Ayarlar**'dan projeyi paylaşabilir veya şablon olarak kaydedebilirsiniz.",
			doneTitle: "Hazırsınız!",
			doneBody:
				"Takıldığınızda **Yardım** menüsünden yardım merkezine ulaşabilir ya da bu öğreticiyi yeniden başlatabilirsiniz. İyi çizimler!",
		},
	},
	help: {
		turkishDocuments: "Türkçe belgeler",
		indexBadge: "Yardım merkezi",
		indexTitle: "Size nasıl yardımcı olabiliriz?",
		indexIntro:
			"TikZ Studio'yu adım adım öğrenin: ilk projeden derleme motorlarına, Türkçe belgelerden sık görülen LaTeX hatalarına kadar.",
		searchLabel: "Yardım makalelerinde ara",
		searchPlaceholder: "Ara: ör. babel, zaman aşımı, PNG",
		newHereTitle: "TikZ Studio'da yeni misiniz?",
		newHereBody:
			"Kısa öğretici; bir şablondan proje oluşturmayı, derlemeyi ve çıktıyı indirmeyi ekranın üzerinde gösterir.",
		noResultsTitle: "Sonuç bulunamadı",
		noResultsBody:
			"Farklı bir kelime deneyin ya da <link>sıkça sorulan sorulara</link> göz atın.",
		read: "Oku",
		topics: "Yardım konuları",
		breadcrumb: "Konum",
		previous: "Önceki",
		next: "Sonraki",
		allTopics: "Tüm yardım konuları",
		onThisPage: "Bu sayfada",
		footer: "TikZ Studio yardım merkezi",
		calloutTip: "İpucu",
		calloutWarning: "Dikkat",
		calloutInfo: "Bilgi",
		copied: "Kopyalandı",
		copyCode: "Kodu kopyala",
		copy: "Kopyala",
	},
	errors: {
		unauthorized: "Oturum açmanız gerekiyor.",
		invalidRequest: "Geçersiz istek.",
		unexpected: "Beklenmeyen bir sunucu hatası oluştu.",
		projectNotFound: "Proje bulunamadı.",
		projectFileNotFound: "Proje dosyası bulunamadı.",
		templateNotFound: "Şablon bulunamadı.",
		snippetNotFound: "Kod parçacığı bulunamadı.",
		compileJobNotFound: "Derleme işi bulunamadı.",
		outputNotFound: "Çıktı bulunamadı.",
		previewNotFound: "Önizleme bulunamadı.",
		fileExists: "Bu yolda zaten bir dosya var.",
		mainFileDelete:
			"Ana dosya silinemez. Önce başka bir dosyayı ana dosya yapın.",
		mainFileNotFound: "Ana dosya bulunamadı.",
		noFilesToCompile: "Derlenecek dosya yok.",
		compileRateLimited:
			"Çok fazla derleme isteği. Dakikada en fazla {max} derleme yapabilirsiniz.",
		templateNeedsFile: "En az bir dosya gerekli.",
		snippetTriggerRequired: "Tetikleyici boş olamaz.",
		snippetTriggerTaken: '"\\{trigger}" tetikleyicisi zaten kullanımda.',
		sourceTooLarge: "Kaynak dosyalar izin verilen boyutu aşıyor.",
		unsafePathRejected: "Güvenli olmayan dosya yolu reddedildi: {path}",
		fileFieldRequired: "Dosya alanı gerekli.",
		uploadTooLarge: "Dosya 5 MB'dan büyük olamaz ({size} MB)",
		zipRequired: "ZIP dosyası gerekli.",
		zipTooLarge: "ZIP dosyası en fazla 20 MB olabilir.",
		archiveTooManyFiles: "ZIP en fazla {max} dosya içerebilir.",
		archiveFileTooLarge:
			'"{name}" 5 MB\'tan büyük; ZIP içindeki her dosya en fazla 5 MB olabilir.',
		archiveTotalTooLarge:
			"ZIP içindeki dosyaların toplam boyutu en fazla 25 MB olabilir.",
		archiveInvalid: "Dosya geçerli bir ZIP arşivi değil.",
		archiveContentTooLarge: "ZIP içindeki dosyalar izin verilen boyutu aşıyor.",
		archiveNoTex: "ZIP içinde .tex dosyası bulunamadı.",
		img2latexUnreachable:
			"{service} hizmetine şu anda ulaşılamıyor. Biraz sonra yeniden deneyin.",
		img2latexServiceError: "{service} hatası ({status}): {detail}",
		img2latexModelError: "Model hatası: {detail}",
		img2latexMathpixError: "Mathpix: {detail}",
		mathpixNotConfigured:
			"Mathpix yapılandırılmamış. MATHPIX_APP_ID ve MATHPIX_APP_KEY gerekli.",
		img2latexNotConfigured:
			"Görselden LaTeX'e dönüştürme bu sunucuda yapılandırılmamış.",
		imageFieldRequired: "image alanı gerekli.",
		imageFormatUnsupported: "Desteklenen formatlar: PNG, JPEG, WebP.",
		imageTooLarge: "Görüntü 4 MB'dan büyük olamaz ({size} MB).",
		img2latexEmpty:
			"Görüntüden LaTeX çıkarılamadı. Daha net bir görüntü deneyin.",
		projectTitleRequired: "Proje adı boş olamaz.",
		projectTitleTooLong: "Proje adı en fazla 120 karakter olabilir.",
		descriptionTooLong: "Açıklama en fazla 500 karakter olabilir.",
		pathRequired: "Dosya yolu boş olamaz.",
		pathTooLong: "Dosya yolu en fazla {max} karakter olabilir.",
		pathUnsafe:
			"Dosya yolu yalnızca harf (Türkçe harfler dahil), rakam, nokta, tire, alt çizgi ve klasör ayırıcı (/) içerebilir; boşluk ve '..' kullanılamaz.",
		templateTitleRequired: "Şablon adı boş olamaz.",
		templateTitleTooLong: "Şablon adı en fazla 120 karakter olabilir.",
		categoryTooLong: "Kategori en fazla 60 karakter olabilir.",
		invalidLocale: "Desteklenmeyen dil.",
	},
	archive: {
		skipped: '"{name}" atlandı (geçersiz veya yinelenen dosya adı).',
		renamed:
			'"{name}" adı "{cleaned}" olarak değiştirildi; belgede bu dosyaya verdiğiniz yolları güncelleyin.',
	},
	compileLog: {
		outputTooLarge: "Çıktı izin verilen en büyük boyutu aştı.",
		svgTooLarge: "SVG çıktısı izin verilen en büyük boyutu aştı.",
		failed: "Derleme başarısız oldu.",
		timedOut: "Derleme zaman aşımına uğradı.",
		interrupted: "Derleme sunucu yeniden başlatma sırasında kesintiye uğradı.",
		jobFailed: "Derleme işi başarısız oldu.",
	},
	emails: {
		greetingNamed: "Merhaba {name},",
		greeting: "Merhaba,",
		buttonFallback: "Düğme çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:",
		verifySubject: "TikZ Studio: e-posta adresinizi doğrulayın",
		verifyIntro:
			"TikZ Studio hesabınızı etkinleştirmek için e-posta adresinizi doğrulayın.",
		verifyOutro:
			"Bu bağlantı 24 saat geçerlidir. Bu hesabı siz oluşturmadıysanız bu e-postayı yok sayabilirsiniz.",
		verifyAction: "E-postamı doğrula",
		resetSubject: "TikZ Studio: şifre sıfırlama",
		resetIntro:
			"Hesabınız için bir şifre sıfırlama isteği aldık. Yeni şifrenizi belirlemek için aşağıdaki bağlantıyı kullanın.",
		resetOutro:
			"Bu bağlantı 1 saat geçerlidir ve yalnızca bir kez kullanılabilir. İsteği siz yapmadıysanız bu e-postayı yok sayın; şifreniz değişmez.",
		resetAction: "Yeni şifre belirle",
		changedSubject: "TikZ Studio: şifreniz değiştirildi",
		changedIntroRevoked:
			"Hesabınızın şifresi değiştirildi ve diğer cihazlardaki oturumlarınız kapatıldı.",
		changedIntro: "Hesabınızın şifresi değiştirildi.",
		changedOutro:
			'Bu değişikliği siz yapmadıysanız hemen "Şifremi unuttum" ile şifrenizi sıfırlayın.',
	},
};

export type Messages = typeof tr;
