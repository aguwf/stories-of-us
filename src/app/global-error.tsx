"use client";

import NextError from "next/error";

export default function GlobalError(props: {
	error: NextError & { digest?: string };
	params: { locale: string };
}) {
	return (
		<html lang={props.params.locale}>
			<body>
				{/* This is the default Next.js error component but it doesn't allow omitting the statusCode property yet. */}
				<NextError statusCode={undefined as any} />
			</body>
		</html>
	);
}
