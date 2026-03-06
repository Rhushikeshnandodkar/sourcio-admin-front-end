"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Hook to detect user inactivity and logout after timeout
 * Tracks mouse, keyboard, scroll, touch, and visibility events
 */
export function useInactivity() {
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Initialize with 0, will be set properly when timer starts
  const lastActivityRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Only set timer if user is authenticated and not paused
    if (isAuthenticated && !isPausedRef.current) {
      lastActivityRef.current = Date.now();

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        console.log("User inactive for 1 hour, logging out...");
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isAuthenticated, logout]);

  const handleActivity = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden) {
      // Tab is hidden, pause timer
      isPausedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      // Tab is visible, resume timer
      isPausedRef.current = false;
      const timeSinceLastActivity = Date.now() - lastActivityRef.current;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        // Already exceeded timeout while hidden, logout immediately
        console.log(
          "User inactive exceeded timeout while tab was hidden, logging out..."
        );
        logout();
      } else {
        // Resume timer with remaining time
        const remainingTime = INACTIVITY_TIMEOUT - timeSinceLastActivity;
        timeoutRef.current = setTimeout(() => {
          console.log("User inactive for 1 hour, logging out...");
          logout();
        }, remainingTime);
      }
    }
  }, [logout]);

  useEffect(() => {
    // Only set up inactivity detection if user is authenticated
    if (!isAuthenticated) {
      // Clear timer if user is not authenticated
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Initialize timer
    resetTimer();

    // Activity events
    const events = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "mousemove",
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, handleActivity, handleVisibilityChange, resetTimer]);
}
