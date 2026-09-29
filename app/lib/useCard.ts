"use client";

import { useCallback, useRef, useState } from "react";
import { describeError, getJson } from "./api";
import type { CardState } from "./types";

// One instance per card. Handles loading/error state and ignores stale
// responses if the user starts a new investigation before the old one ends.
export function useCard<T>() {
  const [state, setState] = useState<CardState<T>>({ status: "idle" });
  const latest = useRef(0);

  // Run any async task and reflect it in the card
  const exec = useCallback(async (task: () => Promise<T>): Promise<T | null> => {
    const id = ++latest.current;
    setState({ status: "loading" });
    try {
      const data = await task();
      if (id !== latest.current) return null;
      setState({ status: "done", data });
      return data;
    } catch (e) {
      if (id === latest.current) {
        setState({ status: "error", error: describeError(e) });
      }
      return null;
    }
  }, []);

  // Shortcut for a plain GET
  const run = useCallback((path: string) => exec(() => getJson<T>(path)), [exec]);

  // Show the loading state while waiting on other checks
  const wait = useCallback(() => {
    latest.current++;
    setState({ status: "loading" });
  }, []);

  const skip = useCallback((note: string) => {
    latest.current++;
    setState({ status: "skipped", note });
  }, []);

  const reset = useCallback(() => {
    latest.current++;
    setState({ status: "idle" });
  }, []);

  return { state, exec, run, wait, skip, reset };
}