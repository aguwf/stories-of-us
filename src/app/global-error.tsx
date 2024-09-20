"use client";

import { useEffect } from 'react';
import NextError from "next/error";

export default function GlobalError({
	error,
	params: { locale }
}: {
	error: Error & { digest?: string };
	params: { locale: string };
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error(error);
	}, [error]);

	return (
		<html lang={locale}>
			<body>
				<div style={{ padding: '20px', textAlign: 'center' }}>
					<h1>Oops! Something went wrong</h1>
					<p>We're sorry, but an unexpected error occurred.</p>
					{process.env.NODE_ENV === 'development' && (
						<details style={{ marginTop: '20px', textAlign: 'left' }}>
							<summary>Error details</summary>
							<pre>{error.message}</pre>
							{error.digest && <p>Error ID: {error.digest}</p>}
						</details>
					)}
				</div>
				{/* Fallback to Next.js error component */}
				<NextError statusCode={500} />
			</body>
		</html>
	);
}
