"use client";

import { ArrowLeft, ArrowRight, Check, Compass, X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { renderInline } from "@/features/help/components/inline-text";
import {
	dismissTour,
	finishTour,
	setTourStep,
	startTour,
	useTourState,
} from "@/features/help/tour/tour-state";
import {
	firstStepOf,
	getStepIndex,
	TOUR_STEPS,
	type TourPage,
} from "@/features/help/tour/tour-steps";
import { useT } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const GAP = 12;
const MARGIN = 16;
const SPOT_PADDING = 6;
const MOBILE_BREAKPOINT = 640;

/** First *visible* element with the given data-tour value, if any. */
function findTarget(name: string | undefined): HTMLElement | null {
	if (!name) return null;
	const candidates = document.querySelectorAll<HTMLElement>(
		`[data-tour="${name}"]`,
	);
	for (const element of candidates) {
		const rect = element.getBoundingClientRect();
		if (rect.width > 0 && rect.height > 0) return element;
	}
	return null;
}

function sameRect(a: Rect | null, b: Rect | null) {
	if (a === b) return true;
	if (!a || !b) return false;
	return (
		Math.abs(a.top - b.top) < 0.5 &&
		Math.abs(a.left - b.left) < 0.5 &&
		Math.abs(a.width - b.width) < 0.5 &&
		Math.abs(a.height - b.height) < 0.5
	);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), Math.max(min, max));
}

/** Where to put the card (fixed position) relative to the highlighted rect. */
function placeCard(
	target: Rect | null,
	card: { width: number; height: number },
	viewport: { width: number; height: number },
): { top: number; left: number } {
	const { width: vw, height: vh } = viewport;
	const { width: w, height: h } = card;

	if (!target) {
		return { top: Math.max(MARGIN, (vh - h) / 2), left: (vw - w) / 2 };
	}

	// Phones: dock to the edge farthest from the target.
	if (vw < MOBILE_BREAKPOINT) {
		const targetCenter = target.top + target.height / 2;
		return {
			left: MARGIN,
			top: targetCenter > vh / 2 ? MARGIN : Math.max(MARGIN, vh - h - MARGIN),
		};
	}

	const centeredLeft = clamp(
		target.left + target.width / 2 - w / 2,
		MARGIN,
		vw - w - MARGIN,
	);
	const centeredTop = clamp(
		target.top + target.height / 2 - h / 2,
		MARGIN,
		vh - h - MARGIN,
	);

	if (target.top + target.height + GAP + h <= vh - MARGIN) {
		return { top: target.top + target.height + GAP, left: centeredLeft };
	}
	if (target.top - GAP - h >= MARGIN) {
		return { top: target.top - GAP - h, left: centeredLeft };
	}
	if (target.left + target.width + GAP + w <= vw - MARGIN) {
		return { top: centeredTop, left: target.left + target.width + GAP };
	}
	if (target.left - GAP - w >= MARGIN) {
		return { top: centeredTop, left: target.left - GAP - w };
	}
	// Target fills the screen (e.g. the editor pane): sit inside its bottom.
	return {
		top: clamp(
			target.top + target.height - h - MARGIN,
			MARGIN,
			vh - h - MARGIN,
		),
		left: centeredLeft,
	};
}

/**
 * Lightweight first-time guided tour.
 *
 * - Never blocks the page: the dimmed backdrop ignores pointer events, so the
 *   highlighted control (and everything else) stays clickable.
 * - A step whose element is missing or hidden falls back to a centred card.
 * - Progress lives in localStorage (see tour-state.ts); a brand-new visitor
 *   gets the tour automatically, everyone else only after "Start the tour".
 */
export function OnboardingTour({ page }: { page: TourPage }) {
	const t = useT();
	const state = useTourState();
	const titleId = useId();
	const cardRef = useRef<HTMLDivElement | null>(null);
	const scrolledForStep = useRef<string | null>(null);

	const [targetRect, setTargetRect] = useState<Rect | null>(null);
	const [cardSize, setCardSize] = useState({ width: 360, height: 220 });
	const [viewport, setViewport] = useState({ width: 1280, height: 800 });

	const activeStepId = state?.status === "active" ? state.stepId : null;
	const stepIndex = activeStepId ? getStepIndex(activeStepId) : -1;
	const step = stepIndex >= 0 ? TOUR_STEPS[stepIndex] : null;
	const stepOnThisPage = step?.page === page ? step : null;

	// First visit: start automatically. On the editor, a tour still waiting
	// on a dashboard step ("create a project") moves on to the editor part.
	useEffect(() => {
		if (state === undefined) return;
		if (state === null) {
			startTour(page);
			return;
		}
		if (page === "editor" && step?.page === "dashboard") {
			setTourStep(firstStepOf("editor").id);
		}
	}, [page, state, step?.page]);

	const measure = useCallback(() => {
		setViewport((previous) =>
			previous.width === window.innerWidth &&
			previous.height === window.innerHeight
				? previous
				: { width: window.innerWidth, height: window.innerHeight },
		);

		const element = findTarget(stepOnThisPage?.target);
		const raw = element?.getBoundingClientRect();
		const next: Rect | null = raw
			? {
					top: raw.top,
					left: raw.left,
					width: raw.width,
					height: raw.height,
				}
			: null;
		setTargetRect((previous) => (sameRect(previous, next) ? previous : next));

		const card = cardRef.current;
		if (card) {
			const width = card.offsetWidth;
			const height = card.offsetHeight;
			setCardSize((previous) =>
				previous.width === width && previous.height === height
					? previous
					: { width, height },
			);
		}

		// Bring the target into view once per step (not on every poll).
		if (
			element &&
			stepOnThisPage &&
			scrolledForStep.current !== stepOnThisPage.id
		) {
			scrolledForStep.current = stepOnThisPage.id;
			const rect = element.getBoundingClientRect();
			if (rect.top < 0 || rect.bottom > window.innerHeight) {
				element.scrollIntoView({ block: "center", behavior: "smooth" });
			}
		}
	}, [stepOnThisPage]);

	// Targets can appear late (data loading) or move (panels resizing), so
	// poll cheaply while a step is visible, plus react to resize/scroll.
	useEffect(() => {
		if (!stepOnThisPage) return;
		measure();
		const interval = window.setInterval(measure, 300);
		window.addEventListener("resize", measure);
		window.addEventListener("scroll", measure, true);
		return () => {
			window.clearInterval(interval);
			window.removeEventListener("resize", measure);
			window.removeEventListener("scroll", measure, true);
		};
	}, [measure, stepOnThisPage]);

	useEffect(() => {
		if (state?.status !== "active") return;
		// Only while focus is inside the card, so Escape still closes menus
		// and dialogs elsewhere without ending the tour.
		function onKeyDown(event: KeyboardEvent) {
			if (
				event.key === "Escape" &&
				cardRef.current?.contains(document.activeElement)
			) {
				dismissTour();
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [state?.status]);

	if (!step) return null;

	// The tour is waiting for the user to open a project in the editor.
	if (!stepOnThisPage) {
		if (page !== "dashboard" || step.page !== "editor") return null;
		return (
			<div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
				<div
					role="status"
					className="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl border border-(--line) bg-(--surface-1) px-4 py-3 text-sm shadow-[0_18px_40px_rgba(44,31,20,0.18)]"
				>
					<Compass className="size-4 shrink-0 text-(--accent-strong)" />
					<p className="leading-5 text-(--ink-1)">{t("tour.resumeHint")}</p>
					<Button type="button" variant="ghost" size="xs" onClick={dismissTour}>
						{t("common.close")}
					</Button>
				</div>
			</div>
		);
	}

	const isFirst = stepIndex === 0 || TOUR_STEPS[stepIndex - 1]?.page !== page;
	const isLast = stepIndex === TOUR_STEPS.length - 1;
	const nextStep = TOUR_STEPS[stepIndex + 1];
	const position = placeCard(targetRect, cardSize, viewport);
	const isPhone = viewport.width < MOBILE_BREAKPOINT;

	const spot = targetRect
		? {
				top: Math.max(0, targetRect.top - SPOT_PADDING),
				left: Math.max(0, targetRect.left - SPOT_PADDING),
				width: Math.min(
					targetRect.width + SPOT_PADDING * 2,
					viewport.width - Math.max(0, targetRect.left - SPOT_PADDING),
				),
				height: Math.min(
					targetRect.height + SPOT_PADDING * 2,
					viewport.height - Math.max(0, targetRect.top - SPOT_PADDING),
				),
			}
		: null;

	return (
		<>
			{/* Dim layer with a hole around the target. Never intercepts clicks. */}
			<div
				aria-hidden
				data-tour-overlay
				className={cn(
					"pointer-events-none fixed z-40 rounded-2xl transition-all duration-200 ease-out",
					spot
						? "shadow-[0_0_0_9999px_rgba(31,26,22,0.42)] ring-2 ring-(--accent-strong) ring-offset-2 ring-offset-transparent"
						: "inset-0 rounded-none bg-[rgba(31,26,22,0.32)]",
				)}
				style={spot ?? undefined}
			/>

			<div
				ref={cardRef}
				role="dialog"
				aria-modal="false"
				aria-labelledby={titleId}
				data-tour-card
				className="fixed z-40 rounded-3xl border border-white/70 bg-[linear-gradient(160deg,rgba(255,250,242,0.99),rgba(244,239,231,0.99))] p-5 text-(--ink-0) shadow-[0_24px_60px_rgba(31,26,22,0.28)] transition-[top,left] duration-200 ease-out"
				style={{
					top: position.top,
					left: position.left,
					width: isPhone
						? viewport.width - MARGIN * 2
						: Math.min(360, viewport.width - MARGIN * 2),
				}}
			>
				<div className="flex items-start justify-between gap-3">
					<p className="text-xs font-medium uppercase tracking-[0.14em] text-(--accent-strong)">
						{t("tour.progress", {
							current: stepIndex + 1,
							total: TOUR_STEPS.length,
						})}
					</p>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={dismissTour}
						aria-label={t("tour.close")}
						title={t("tour.close")}
						className="-mr-1 -mt-1"
					>
						<X />
					</Button>
				</div>
				<h2 id={titleId} className="mt-2 text-lg font-semibold leading-snug">
					{t(stepOnThisPage.title)}
				</h2>
				<p className="mt-2 text-sm leading-6 text-(--ink-1)">
					{renderInline(t(stepOnThisPage.body))}
				</p>

				<div className="mt-4 flex gap-1" aria-hidden>
					{TOUR_STEPS.map((candidate, index) => (
						<span
							key={candidate.id}
							className={cn(
								"h-1 flex-1 rounded-full",
								index <= stepIndex
									? "bg-(--accent-strong)"
									: "bg-[rgba(31,26,22,0.12)]",
							)}
						/>
					))}
				</div>

				<div className="mt-4 flex items-center justify-between gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={dismissTour}
						className="text-(--ink-1)"
					>
						{t("tour.skip")}
					</Button>
					<div className="flex items-center gap-2">
						{!isFirst ? (
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setTourStep(TOUR_STEPS[stepIndex - 1].id)}
							>
								<ArrowLeft />
								{t("tour.back")}
							</Button>
						) : null}
						{isLast ? (
							<Button type="button" size="sm" onClick={finishTour}>
								<Check />
								{t("tour.finish")}
							</Button>
						) : (
							<Button
								type="button"
								size="sm"
								onClick={() => setTourStep(nextStep.id)}
							>
								{nextStep.page !== page ? t("tour.gotIt") : t("tour.next")}
								<ArrowRight />
							</Button>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
