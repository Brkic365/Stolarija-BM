export type Finish = "breza" | "hrast" | "crna" | "bijela";

export const FINISHES: { id: Finish; label: string; color: string; wall: string; roughness: number }[] = [
  { id: "breza", label: "Breza", color: "#dcc39b", wall: "#efebe3", roughness: 0.8 },
  { id: "hrast", label: "Hrast", color: "#a77a4c", wall: "#ece7de", roughness: 0.75 },
  { id: "crna", label: "Crna", color: "#262421", wall: "#d9d4ca", roughness: 0.6 },
  { id: "bijela", label: "Bijela", color: "#f1eee8", wall: "#cfc9be", roughness: 0.85 },
];
