"use client";

import { StyleProvider } from "@ant-design/cssinjs";

export default function Provider({ children }: { children: React.ReactNode }) {
	return <StyleProvider layer>{children}</StyleProvider>;
}
