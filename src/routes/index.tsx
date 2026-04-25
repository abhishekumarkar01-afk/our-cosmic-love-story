import { createFileRoute } from "@tanstack/react-router";
import { CinematicExperience } from "@/components/cinematic/CinematicExperience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Palak — My Universe" },
      { name: "description", content: "A cinematic love letter through the stars, for Palak." },
      { property: "og:title", content: "For Palak — My Universe" },
      { property: "og:description", content: "A cinematic love letter through the stars." },
    ],
  }),
  component: Index,
});

function Index() {
  return <CinematicExperience name="Palak" />;
}
