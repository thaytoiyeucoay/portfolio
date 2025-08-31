export type Marker = {
  label: string;
  lat: number; // degrees
  lon: number; // degrees
  type?: "study" | "work" | "project";
};

export const markers: Marker[] = [
  { label: "HCMUT — Study", lat: 10.772, lon: 106.659, type: "study" },
  { label: "Hanoi — Work", lat: 21.028, lon: 105.834, type: "work" },
  { label: "Singapore — Project", lat: 1.3521, lon: 103.8198, type: "project" },
  { label: "San Francisco — Project", lat: 37.7749, lon: -122.4194, type: "project" },
];
