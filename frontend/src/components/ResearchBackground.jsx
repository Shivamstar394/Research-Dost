import Particles from "react-tsparticles";

export default function ResearchBackground() {
  return (
    <Particles
      options={{
        fullScreen: { enable: true, zIndex: -1 },

        background: {
          color: "#020617"
        },

        particles: {
          number: { value: 60 },

          color: { value: "#6366f1" },

          size: { value: 2 },

          move: {
            enable: true,
            speed: 0.6
          },

          links: {
            enable: true,
            color: "#a855f7",
            distance: 150,
            opacity: 0.3
          }
        }
      }}
    />
  );
}