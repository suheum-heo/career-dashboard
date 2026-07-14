/** Fire before router.push so the top progress bar starts immediately. */
export function signalNavigation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("careertrack:navigate"));
  }
}
