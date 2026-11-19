"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
	firstStepOf,
	getStepIndex,
	type TourPage,
} from "@/features/help/tour/tour-steps";

/**
 * Onboarding-tour progress, remembered per browser in localStorage.
 *
 * Storage may be unavailable (private mode, blocked site data), so every
 * access is wrapped in try/catch and falls back to an in-memory value: the
 * tour then still works for the current page view.
 */

export type TourState =
	| { status: "active"; stepId: string }
	| { status: "done" }
	| { status: "dismissed" };

const STORAGE_KEY = "tikzstudio.onboarding-tour.v1";
const CHANGE_EVENT = "tikzstudio:onboarding-tour";
/** Snapshot used during SSR and hydration: "not known yet". */
const SERVER_SNAPSHOT = "__server__";

let memoryValue: string | null = null;

function readRaw(): string | null {
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return memoryValue;
	}
}

function writeRaw(value: string) {
	memoryValue = value;
	try {
		window.localStorage.setItem(STORAGE_KEY, value);
	} catch {
		// Storage blocked: the in-memory value keeps the tour usable.
	}
	window.dispatchEvent(new Event(CHANGE_EVENT));
}

function parse(raw: string | null): TourState | null {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw) as Partial<TourState> & { stepId?: unknown };
		if (value.status === "done" || value.status === "dismissed") {
			return { status: value.status };
		}
		if (
			value.status === "active" &&
			typeof value.stepId === "string" &&
			getStepIndex(value.stepId) >= 0
		) {
			return { status: "active", stepId: value.stepId };
		}
	} catch {
		// Corrupt value: treat as never seen.
	}
	return null;
}

function subscribe(onChange: () => void) {
	const onStorage = (event: StorageEvent) => {
		if (event.key === null || event.key === STORAGE_KEY) onChange();
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener(CHANGE_EVENT, onChange);
	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener(CHANGE_EVENT, onChange);
	};
}

/**
 * Returns `undefined` until the stored value is known on the client,
 * `null` when the tour was never started, otherwise the saved state.
 */
export function useTourState(): TourState | null | undefined {
	const raw = useSyncExternalStore(subscribe, readRaw, () => SERVER_SNAPSHOT);
	return useMemo(
		() => (raw === SERVER_SNAPSHOT ? undefined : parse(raw)),
		[raw],
	);
}

export function setTourStep(stepId: string) {
	writeRaw(JSON.stringify({ status: "active", stepId }));
}

export function startTour(page: TourPage = "dashboard") {
	setTourStep(firstStepOf(page).id);
}

export function finishTour() {
	writeRaw(JSON.stringify({ status: "done" }));
}

export function dismissTour() {
	writeRaw(JSON.stringify({ status: "dismissed" }));
}
