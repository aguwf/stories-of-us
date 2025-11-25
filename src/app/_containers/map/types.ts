export interface StoreData {
  name: string;
  address: string;
  notes: string;
  coordinates: [number, number];
  distance?: string;
  openingHours?: string;
  rating?: number;
  images?: string[];
  tags?: string[];
  price?: 1 | 2 | 3 | 4;
  amenities?: string[];
  popularity?: number;
}
