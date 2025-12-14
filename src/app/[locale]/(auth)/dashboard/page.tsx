import { getTranslations } from "next-intl/server";
import { buildLocalizedMetadata } from "@/utils/seo";

export async function generateMetadata(props: { params: { locale: string } }) {
	const t = await getTranslations({
		locale: props.params.locale,
		namespace: "Dashboard",
	});

	return buildLocalizedMetadata({
		locale: props.params.locale,
		path: "/dashboard",
		title: t("meta_title"),
	});
}

const Dashboard = () => <div className="[&_p]:my-6">Hello</div>;

export default Dashboard;
