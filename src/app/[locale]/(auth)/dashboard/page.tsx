import { getTranslations } from "next-intl/server";
import { buildLocalizedMetadata } from "@/utils/seo";
import DashboardClient from "@/app/_components/Dashboard/DashboardClient";

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

const Dashboard = () => {
    return <DashboardClient />;
};

export default Dashboard;
