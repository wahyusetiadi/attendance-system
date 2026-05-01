"use client";

import { getApiMode } from "@/lib/apiMode";
import { ensureMockSeeded, resetMockDb } from "./db";

declare global {
  interface Window {
    __mock?: {
      seed: () => void;
      reset: () => void;
      keys: {
        teachers: string;
        attendance: string;
        meta: string;
      };
    };
  }
}

export function initMockDevtools() {
  if (typeof window === "undefined") return;
  if (getApiMode() !== "mock") return;
  if (process.env.NEXT_PUBLIC_ENABLE_MOCK_DEVTOOLS !== "true") return;

  window.__mock = {
    seed: () => ensureMockSeeded(),
    reset: () => {
      resetMockDb();
      ensureMockSeeded();
      window.location.reload();
    },
    keys: {
      teachers: "mock_teachers_v1",
      attendance: "mock_attendance_v1",
      meta: "mock_meta_v1",
    },
  };
}
