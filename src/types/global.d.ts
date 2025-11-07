// Use type safe message keys with `next-intl`
type Messages = typeof import("../locales/en.json");
type IntlMessages = Messages;

declare module "*.glb" {
	const content: string;
	export default content;
}
