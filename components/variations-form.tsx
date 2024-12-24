import { useState, useEffect } from 'react';
import { Size, Color } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface VariationsFormProps {
  productId: string;
  storeId: string;
  sizes: Size[];
  colors: Color[];
  initialVariations?: any[];
  onSuccess?: (variations: any[]) => void;
}

export const VariationsForm = ({
  productId,
  storeId,
  sizes,
  colors,
  initialVariations = [],
  onSuccess
}: VariationsFormProps) => {
  const [variations, setVariations] = useState(initialVariations);
  const [isLoading, setIsLoading] = useState(false);

  const addVariation = async () => {
    try {
      setIsLoading(true);
      const newVariations = [...variations, { colorId: '', sizeId: '', stock: 0 }];
      
      // Enregistrer les variations
      await axios.post(`/api/${storeId}/products/${productId}/variations`, {
        variations: newVariations.map(v => ({
          colorId: v.colorId,
          sizeId: v.sizeId,
          stock: v.stock ? parseInt(String(v.stock)) : 0
        }))
      });

      setVariations(newVariations);
      toast.success('Variation ajoutée avec succès');
      onSuccess?.(newVariations);
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'ajout de la variation');
    } finally {
      setIsLoading(false);
    }
  };

  const removeVariation = async (index: number) => {
    try {
      setIsLoading(true);
      const newVariations = variations.filter((_, i) => i !== index);
      
      // Enregistrer les variations
      await axios.post(`/api/${storeId}/products/${productId}/variations`, {
        variations: newVariations.map(v => ({
          colorId: v.colorId,
          sizeId: v.sizeId,
          stock: parseInt(v.stock)
        }))
      });

      setVariations(newVariations);
      toast.success('Variation supprimée avec succès');
      onSuccess?.(newVariations);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la suppression de la variation');
    } finally {
      setIsLoading(false);
    }
  };

  const updateVariation = async (index: number, field: string, value: string | number) => {
    try {
      const updatedVariations = [...variations];
      updatedVariations[index] = {
        ...updatedVariations[index],
        [field]: field === 'stock' ? parseInt(String(value)) || 0 : value
      };

      // Enregistrer les variations
      await axios.post(`/api/${storeId}/products/${productId}/variations`, {
        variations: updatedVariations.map(v => ({
          colorId: v.colorId,
          sizeId: v.sizeId,
          stock: v.stock ? parseInt(String(v.stock)) : 0
        }))
      });

      setVariations(updatedVariations);
      onSuccess?.(updatedVariations);
    } catch (error) {
      toast.error('Une erreur est survenue lors de la mise à jour de la variation');
    }
  };

  return (
    <div className="space-y-4">
      <div className="font-medium">Variations du produit</div>
      {variations.map((variation, index) => (
        <div key={index} className="flex items-center gap-4">
          <Select
            value={variation.colorId}
            onValueChange={(value) => updateVariation(index, 'colorId', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une couleur" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={variation.sizeId}
            onValueChange={(value) => updateVariation(index, 'sizeId', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sélectionner une taille" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            placeholder="Stock"
            value={variation.stock}
            onChange={(e) => updateVariation(index, 'stock', e.target.value)}
            className="w-[100px]"
          />
          <Button
            variant="destructive"
            size="icon"
            onClick={() => removeVariation(index)}
            disabled={isLoading}
          >
            X
          </Button>
        </div>
      ))}
      <Button 
        onClick={addVariation}
        variant="outline"
        className="mt-4"
        disabled={isLoading}
      >
        Ajouter une variation
      </Button>
    </div>
  );
};
