import React from 'react';
import {
  Store, UtensilsCrossed, Stethoscope, Wrench, Scissors, Shirt,
  Smartphone, Sparkles, Car, WashingMachine, Camera, Building2,
  Briefcase, ShoppingBag,
} from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'retail-groceries': ShoppingBag,
  'fashion-apparel': Shirt,
  'food-vendor': UtensilsCrossed,
  'pharmacy-health': Stethoscope,
  'beauty-service': Sparkles,
  'barber-shop': Scissors,
  'home-services': Wrench,
  'auto-repair': Car,
  'cleaning-service': WashingMachine,
  'tech-store': Smartphone,
  'thrift-store': Shirt,
  'laundry-service': WashingMachine,
  'photographer-service': Camera,
  'estate-agent': Building2,
};

export function OsmPersonaIcon({ personaId, size = 22 }: { personaId: string; size?: number }) {
  const Icon = ICONS[personaId] || Store;
  return <Icon size={size} strokeWidth={2} />;
}

export function personaIconFor(personaId: string) {
  return ICONS[personaId] || Briefcase;
}
