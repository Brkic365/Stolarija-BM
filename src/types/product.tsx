type ImageType = {
  url: string;
  pathname: string;
};

export type ProductType = {
  id: number;
  name: string;
  description: string;
  price: number;
  images: ImageType[];
  category: string;
  created_at: Date;
};
