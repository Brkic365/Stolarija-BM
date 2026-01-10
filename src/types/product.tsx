type ImageType = {
  url: string;
  pathname: string;
};

// New nested structure for dynamic options
export type OptionChoice = {
  label: string;
  hex?: string;      // For solid colors
  texture?: string;  // For wood/stone patterns (image URL)
  type: 'color' | 'texture';
};

export type ProductOption = {
  name: string; // e.g., "Boja Fronti"
  choices: OptionChoice[];
  default?: number; // Index of the default choice
  targets?: string[]; // Array of mesh names to apply this option to
};

export type ProductType = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: ImageType[];
  category: string;
  created_at: Date;
  orders: number;
  options?: ProductOption[];
};
