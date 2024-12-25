# Documentation de la Gestion des Images dans l'Admin E-commerce

## Problème Initial

La gestion des images dans le formulaire de produit présentait plusieurs défis :
1. Les images n'étaient pas correctement affichées dans les variations
2. Les types TypeScript n'étaient pas correctement alignés
3. La suppression et l'ajout d'images ne fonctionnaient pas correctement
4. La structure des données n'était pas cohérente entre le frontend et le backend

## Solution Recherchée

Nous avions besoin d'une solution qui :
1. Gère correctement les images principales et les images des variations
2. Maintienne une structure de données cohérente
3. Respecte le typage TypeScript
4. Permette une manipulation facile des images (ajout/suppression)

## Structure des Fichiers

### 1. Formulaire de Produit
**Chemin**: `/app/(dashboard)/[storeId]/(routes)/products/[productId]/components/product-form.tsx`

Ce fichier gère le formulaire principal de produit, y compris :
- Les images principales du produit
- Les variations du produit et leurs images
- La validation des données
- La soumission du formulaire

### 2. Composant de Téléchargement d'Images
**Chemin**: `/components/ui/images-upload.tsx`

Composant réutilisable pour :
- Télécharger des images
- Afficher les images existantes
- Gérer la suppression d'images

### 3. Routes API
**Chemin**: `/app/api/[storeId]/products/[productId]/route.ts`

Gère les requêtes API pour :
- Créer un produit
- Mettre à jour un produit
- Supprimer un produit

## Types et Interfaces

\`\`\`typescript
// Types pour les images
interface Image {
  id: string;
  url: string;
  productId: string;
  variationId: string | null;
}

// Types pour les variations
interface Variation {
  id: string;
  colorId: string;
  sizeId: string;
  stock: number;
  images: Image[];
}

// Types pour le formulaire
interface ProductFormValues {
  name: string;
  description?: string;
  images: { url: string; variationId: string | null; }[];
  price: number;
  categoryId: string;
  variations: {
    colorId: string;
    sizeId: string;
    stock: number;
    images: { url: string; variationId: string | null; }[];
  }[];
  isFeatured?: boolean;
  isArchived?: boolean;
}
\`\`\`

## Code Complet des Fichiers

### 1. product-form.tsx
\`\`\`typescript
'use client';

import React, { useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  name: z.string().min(1, 'Le champ doit contenir au moins un caractère.'),
  description: z.string().optional(),
  images: z.array(
    z.object({
      url: z.string(),
      variationId: z.string().nullable()
    })
  ),
  price: z.number().min(0, 'Le prix ne peut pas être négatif.'),
  categoryId: z.string().min(1, 'Veuillez sélectionner une catégorie.'),
  isFeatured: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  variations: z.array(
    z.object({
      id: z.string().optional(),
      colorId: z.string().min(1, 'Veuillez sélectionner une couleur.'),
      sizeId: z.string().min(1, 'Veuillez sélectionner une taille.'),
      stock: z.number().min(0, 'Le stock ne peut pas être négatif.'),
      images: z.array(
        z.object({
          url: z.string(),
          variationId: z.string().nullable()
        })
      )
    })
  )
});

export const ProductForm = ({ initialData, categories, colors, sizes }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? undefined,
      price: parseFloat(String(initialData.price)),
      categoryId: initialData.categoryId,
      images: initialData.images?.map(img => ({
        url: img.url,
        variationId: null
      })) || [],
      isFeatured: initialData.isFeatured,
      isArchived: initialData.isArchived,
      variations: initialData.variations?.map(variation => ({
        id: variation.id,
        colorId: variation.colorId,
        sizeId: variation.sizeId,
        stock: variation.stock,
        images: variation.images?.map(img => ({
          url: img.url,
          variationId: variation.id
        })) || []
      })) || []
    } : {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      images: [],
      isFeatured: false,
      isArchived: false,
      variations: []
    }
  });

  // ... Reste du code
};
\`\`\`

### 2. images-upload.tsx
\`\`\`typescript
import React, { useCallback, useState } from 'react';
import { toast } from "react-hot-toast";

interface ImagesUploadProps {
  disabled?: boolean;
  onChange: (images: string[]) => void;
  onRemove?: (url: string) => void;
  value: string[];
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
}

export const ImagesUpload: React.FC<ImagesUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value = [],
  onUploadStart,
  onUploadEnd
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Convertir les valeurs en URLs simples
  const normalizedValue = (value || []).map(v => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    return v.url || '';
  }).filter(Boolean);

  // ... Reste du code
};
\`\`\`

## Flux de Données

1. **Chargement Initial**
   - Les données sont chargées depuis l'API
   - Les images sont normalisées en format URL
   - Le formulaire est initialisé avec les valeurs par défaut

2. **Ajout d'Images**
   - L'utilisateur sélectionne des images
   - Les images sont téléchargées vers Cloudinary
   - Les URLs sont ajoutées au formulaire avec la structure appropriée

3. **Suppression d'Images**
   - L'utilisateur clique sur le bouton de suppression
   - Une confirmation est demandée
   - L'image est supprimée du formulaire
   - L'interface est mise à jour

4. **Soumission du Formulaire**
   - Les données sont validées
   - Les images sont structurées correctement
   - Les données sont envoyées à l'API

## Routes API

### GET /api/[storeId]/products/[productId]
Récupère les détails d'un produit avec ses images et variations

### PATCH /api/[storeId]/products/[productId]
Met à jour un produit, y compris ses images et variations

### POST /api/[storeId]/products
Crée un nouveau produit avec ses images et variations

## Améliorations Futures Possibles

1. Optimisation des images
   - Compression automatique
   - Redimensionnement adaptatif
   - Formats modernes (WebP)

2. Gestion des erreurs
   - Meilleure gestion des échecs de téléchargement
   - Reprise sur erreur
   - Validation côté serveur plus robuste

3. Performance
   - Chargement lazy des images
   - Mise en cache optimisée
   - Préchargement intelligent

4. UX
   - Prévisualisation des images
   - Drag and drop pour réorganiser
   - Édition d'image intégrée
