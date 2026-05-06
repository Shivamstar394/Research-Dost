import { Joyride } from "react-joyride";

export default function DashboardTour({ run, setRun }) {
  // Keep steps on elements that ALWAYS exist on first load
  // (don’t target .generate-ai-wrapper because it appears only after results/notes tab)
  const steps = [
    {
      target: ".workspace-card",
      content: "Start here: type your research query and search papers.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".ws-form-grid",
      content: "Choose template + run the search. You can refine your query anytime.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".view-switcher",
      content: "Switch between Research and Templates from here.",
      placement: "bottom",
      disableBeacon: true,
    },
    {
      target: ".humanize-wrapper",
      content: "After drafting with AI, use Humanize to improve readability.",
      placement: "top",
      disableBeacon: true,
    },
    {
      target: ".export-wrapper",
      content: "Export your Markdown/LaTeX drafts from here.",
      placement: "top",
      disableBeacon: true,
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          zIndex: 99999,
          primaryColor: "#6366f1",
          // lighter overlay (not too dark/ugly)
          overlayColor: "rgba(15, 23, 42, 0.18)",
          textColor: "#0f172a",
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
        },
        spotlight: {
          borderRadius: 14,
        },
      }}
      callback={(data) => {
        // Use string statuses (works across versions)
        if (data.status === "finished" || data.status === "skipped") {
          localStorage.setItem("rd_tour_done", "1");
          setRun(false);
        }
      }}
    />
  );
}
