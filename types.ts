export interface ProductColumn {
  id: string;
  name: string;
  price: number | string;
  size: string;
  category: string;
  color: string;
  createdAt: string;
  isFeatured: boolean;
  isArchived: boolean;
  stock: number;
  images: { url: string }[];
  variations: {
    id: string;
    colorId: string;
    colorValue: string;
    sizeId: string;
    stock: number;
    images: { url: string }[];
  }[];
}

export type Image = {
  id: string;
  url: string;
  variationId?: string; 
}

export type Color = {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Size = {
  id: string;
  name: string;
  value: string;
  storeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductVariation = {
  id: string;
  productId: string;
  colorId: string;
  sizeId: string;
  stock: number;
  color?: Color;
  size?: Size;
  images: Image[]; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string | null;
  price: number;
  isFeatured: boolean;
  isArchived: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
  };
  variations: ProductVariation[];
  images: Image[]; 
}
