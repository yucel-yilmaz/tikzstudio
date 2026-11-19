"use client";

import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n/client";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	error: Error | null;
};

function ErrorFallback({
	error,
	onReset,
}: {
	error: Error;
	onReset: () => void;
}) {
	const t = useT();

	return (
		<div className="flex h-full min-h-50 flex-col items-center justify-center gap-4 p-8 text-center">
			<p className="text-sm font-medium text-destructive">
				{t("common.unexpectedError")}
			</p>
			<p className="max-w-xs text-xs text-muted-foreground">{error.message}</p>
			<Button size="sm" variant="outline" onClick={onReset}>
				{t("common.tryAgain")}
			</Button>
		</div>
	);
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	override componentDidCatch(error: Error) {
		console.error("[ErrorBoundary]", error);
	}

	override render() {
		if (this.state.error) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<ErrorFallback
					error={this.state.error}
					onReset={() => this.setState({ error: null })}
				/>
			);
		}

		return this.props.children;
	}
}
