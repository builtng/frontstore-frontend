// Suggested "fact" rows merchants can attach to service products, grouped by
// business persona. These are starting points the merchant can pick from,
// edit, or skip entirely in favour of a custom line.

export type ServiceFactPreset = {
  label: string;
};

const DEFAULT_PRESETS: ServiceFactPreset[] = [
  { label: 'Booking required before visit' },
  { label: 'Available by appointment only' },
  { label: 'Cancellations allowed up to 24 hours before' },
];

const PRESETS_BY_PERSONA: Record<string, ServiceFactPreset[]> = {
  'beauty-service': [
    { label: 'Studio session or mobile request' },
    { label: 'Next slots available this week' },
    { label: 'Consultation included before service' },
    { label: 'Bring reference photos for best results' },
  ],
  'food-vendor': [
    { label: 'Made fresh to order' },
    { label: 'Pickup or delivery available' },
    { label: 'Advance notice required for large orders' },
    { label: 'Best enjoyed within a few hours of pickup' },
  ],
  'fashion-apparel': [
    { label: 'Custom fitting session included' },
    { label: 'Alterations available on request' },
    { label: 'Turnaround time may vary by design' },
  ],
  'creator-digital': [
    { label: 'Delivered digitally after session' },
    { label: 'Revisions included' },
    { label: 'Typical turnaround: 2-3 working days' },
  ],
  'faith-community': [
    { label: 'Open to walk-ins and bookings' },
    { label: 'Group sessions available on request' },
  ],
  'school-education': [
    { label: 'One-on-one or group sessions available' },
    { label: 'Materials provided during the session' },
    { label: 'Flexible scheduling on request' },
  ],
  'pharmacy-health': [
    { label: 'Consultation with a licensed professional' },
    { label: 'Available in-store or via home visit' },
    { label: 'Bring previous prescriptions if any' },
  ],
  'retail-groceries': [
    { label: 'Available for pickup or delivery' },
    { label: 'Same-day fulfilment where possible' },
  ],
};

export function getServiceFactPresets(personaId?: string | null): ServiceFactPreset[] {
  if (personaId && PRESETS_BY_PERSONA[personaId]) {
    return PRESETS_BY_PERSONA[personaId];
  }
  return DEFAULT_PRESETS;
}
