// Use type safe message keys with `next-intl`
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import("../locales/en.json");
type IntlMessages = Messages;

declare module "*.glb" {
	const content: string;
	export default content;
}
