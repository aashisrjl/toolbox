import ReactGA from "react-ga4";

let isInitialized = false;

export const initAnalytics = () => {
  if (typeof window === "undefined" || isInitialized) {
    return;
  }

  const measurementId =
    (import.meta.env["VITE_GA_MEASUREMENT_ID"] as string | undefined)?.trim() || "G-289ZLX9VCD";

  if (!measurementId) {
    console.warn("Google Analytics Measurement ID is missing");
    return;
  }

  ReactGA.initialize(measurementId);
  isInitialized = true;
};

export const trackPageView = (path: string) => {
  if (typeof window === "undefined") {
    return;
  }

  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  if (typeof window === "undefined") {
    return;
  }

  ReactGA.event({
    category,
    action,
    ...(label !== undefined ? { label } : {}),
  });
};

export default ReactGA;
