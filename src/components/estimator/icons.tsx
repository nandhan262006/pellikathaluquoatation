import { createElement, type ComponentType } from "react";
import {
  Aperture,
  Baby,
  Building2,
  Cake,
  Camera,
  Construction,
  Drone,
  Film,
  Flower2,
  Gift,
  GraduationCap,
  Heart,
  Home,
  Monitor,
  Printer,
  RadioTower,
  Rotate3d,
  Smile,
  Video,
  Wand2,
} from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;

const MAP: Record<string, IconComponent> = {
  // event types
  heart: Heart,
  cake: Cake,
  flower: Flower2,
  baby: Baby,
  home: Home,
  gift: Gift,
  building: Building2,
  graduation: GraduationCap,
  // coverage
  camera: Camera,
  video: Video,
  aperture: Aperture,
  film: Film,
  drone: Drone,
  // add-ons
  monitor: Monitor,
  radio: RadioTower,
  crane: Construction,
  rotate: Rotate3d,
  printer: Printer,
  smile: Smile,
  wand: Wand2,
};

/**
 * Stable icon component resolved by key. Declared at module scope and using
 * createElement so it satisfies the react-hooks/static-components rule.
 */
export function Icon({ name, className }: { name: string; className?: string }) {
  return createElement(MAP[name] ?? Camera, { className });
}
