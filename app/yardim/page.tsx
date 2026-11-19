import { HelpIndex } from "@/features/help/components/help-index";
import { getHelpIndexData } from "@/features/help/content";
import { getLocale } from "@/lib/i18n/server";

export default async function HelpIndexPage() {
	const { sections, searchText } = getHelpIndexData(await getLocale());

	return <HelpIndex sections={sections} searchText={searchText} />;
}
