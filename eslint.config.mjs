import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default [
	{
		ignores: ["node_modules", ".next", "dist", "build", "coverage", "out", "public"],
	},
	js.configs.recommended,
	{
		files: ["**/*.{ts,tsx,js,jsx,cjs,mjs,mts}"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: null,
			},
			globals: {
				...globals.browser,
				...globals.node,
				React: "readonly",
				JSX: "readonly",
			},
		},
		plugins: {
			"@next/next": nextPlugin,
			"react-hooks": reactHooks,
			"jsx-a11y": jsxA11y,
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			...tseslint?.configs?.recommended[0]?.rules,
			...nextPlugin.configs["core-web-vitals"].rules,
			...jsxA11y.configs.recommended.rules,
			"no-unused-vars": "off",
			"no-undef": "off",
			"jsx-a11y/label-has-associated-control": "warn",
			"jsx-a11y/click-events-have-key-events": "warn",
			"jsx-a11y/no-static-element-interactions": "warn",
			"jsx-a11y/anchor-has-content": "warn",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{
					prefer: "type-imports",
					fixStyle: "inline-type-imports",
				},
			],
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
		},
		settings: {
			next: {
				rootDir: ["./"],
			},
		},
	},
];
