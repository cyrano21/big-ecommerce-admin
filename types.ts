export interface ProductColumn {
  id: string;
  name: string;
  isFeatured: boolean;
  isArchived: boolean;
  price: string;
  category: string;
  size: string;
  color: string;
  images: string[];
  createdAt: string;
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
  variations: Array<{
    id: string;
    productId: string;
    colorId: string;
    sizeId: string;
    stock: number;
    color: {
      id: string;
      name: string;
      value: string;
    };
    size: {
      id: string;
      name: string;
      value: string;
    };
  }>;
  images: Array<{
    id: string;
    url: string;
  }>;
}
