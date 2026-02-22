// Tarifs par taille de benne et type de déchet
export interface BennePricing {
  size: string;
  wasteType: string;
  tonnage: string;
  pricePerTon: number;
  estimate: number;
}

export const BENNE_PRICING: BennePricing[] = [
  // Benne 3m³
  { size: "3m³", wasteType: "Terre / Cailloux", tonnage: "3-5 T", pricePerTon: 30, estimate: 135 },
  { size: "3m³", wasteType: "Gravat Propre", tonnage: "2-4 T", pricePerTon: 30, estimate: 90 },
  { size: "3m³", wasteType: "Gravat Sale", tonnage: "2-4 T", pricePerTon: 150, estimate: 390 },
  // Benne 5m³
  { size: "5m³", wasteType: "Terre / Cailloux", tonnage: "5-8 T", pricePerTon: 30, estimate: 225 },
  { size: "5m³", wasteType: "Gravat Propre", tonnage: "4-6 T", pricePerTon: 30, estimate: 150 },
  { size: "5m³", wasteType: "Gravat Sale", tonnage: "4-6 T", pricePerTon: 150, estimate: 650 },
  { size: "5m³", wasteType: "DIB", tonnage: "0.8-1.8 T", pricePerTon: 299, estimate: 240 },
  // Benne 9m³
  { size: "9m³", wasteType: "Bois", tonnage: "1-2 T", pricePerTon: 136.5, estimate: 200 },
  { size: "9m³", wasteType: "Végétaux", tonnage: "0.8-1.8 T", pricePerTon: 80, estimate: 120 },
  { size: "9m³", wasteType: "DIB", tonnage: "0.8-1.8 T", pricePerTon: 299, estimate: 360 },
];

// Tarifs à la tonne par type de déchet
export interface WastePricing {
  type: string;
  priceHT: number;
  priceTTC: number;
}

export const WASTE_PRICING: WastePricing[] = [
  { type: "Gravat Propre", priceHT: 30, priceTTC: 36 },
  { type: "Gravat Sale", priceHT: 130, priceTTC: 156 },
  { type: "Plâtre", priceHT: 228, priceTTC: 273 },
  { type: "DIB", priceHT: 299, priceTTC: 358.8 },
  { type: "Bois", priceHT: 136.5, priceTTC: 163.8 },
  { type: "Végétaux", priceHT: 104, priceTTC: 124.8 },
  { type: "Terre / Cailloux", priceHT: 30, priceTTC: 36 },
  { type: "Etancheité", priceHT: 390, priceTTC: 468 },
];

// Tarifs BigBag
export interface BigBagPricing {
  pack: string;
  sector: string;
  priceHT: number;
}

export const BIGBAG_PRICING: BigBagPricing[] = [
  { pack: "Pack 3 BigBag", sector: "Canton de Fayence", priceHT: 150 },
  { pack: "Pack 3 BigBag", sector: "Fréjus", priceHT: 180 },
  { pack: "Pack 3 BigBag", sector: "Cannes", priceHT: 200 },
  { pack: "Pack 3 BigBag", sector: "Antibes", priceHT: 220 },
  { pack: "Pack 6 BigBag", sector: "Canton de Fayence", priceHT: 200 },
  { pack: "Pack 6 BigBag", sector: "Fréjus", priceHT: 230 },
  { pack: "Pack 6 BigBag", sector: "Cannes", priceHT: 250 },
  { pack: "Pack 6 BigBag", sector: "Antibes", priceHT: 270 },
];
