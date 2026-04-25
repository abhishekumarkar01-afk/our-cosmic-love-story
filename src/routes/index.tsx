import { createFileRoute } from "@tanstack/react-router";
import { CinematicExperience } from "@/components/cinematic/CinematicExperience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For You, My Universe" },
      { name: "description", content: "A cinematic love letter through the stars." },
      { property: "og:title", content: "For You, My Universe" },
      { property: "og:description", content: "A cinematic love letter through the stars." },
    ],
  }),
  component: Index,
});

function Index() {
  return <CinematicExperience name="My Love" />;
}
