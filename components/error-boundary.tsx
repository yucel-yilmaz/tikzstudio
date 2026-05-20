"use client";

import { Component, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

type Props = {
	children: ReactNode;
	fallback?: ReactNode;
};

type State = {
	error: Error | null;
};

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
				<div className="flex h-full min-h-50 flex-col items-center justify-center gap-4 p-8 text-center">
					<p className="text-sm font-medium text-destructive">
						Beklenmeyen bir hata oluştu
					</p>
					<p className="max-w-xs text-xs text-muted-foreground">
						{this.state.error.message}
					</p>
					<Button
						size="sm"
						variant="outline"
						onClick={() => this.setState({ error: null })}
					>
						Tekrar dene
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
