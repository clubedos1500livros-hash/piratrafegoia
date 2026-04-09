import type { Product } from '@/types/product';

/** Dados locais até conectar ao Supabase. Imagens: Unsplash (placeholders). */
export const mockProducts: Product[] = [
  {
    id: '1',
    restaurant_id: 'demo',
    category: 'hamburguer',
    name: 'Classic Smash',
    description:
      'Dois smashs, queijo cheddar, cebola caramelizada e molho da casa no pão brioche.',
    price: 32.9,
    image_url:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    video_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    ingredients: [
      'Carne bovina 160g',
      'Queijo cheddar',
      'Cebola caramelizada',
      'Molho especial',
      'Pão brioche',
    ],
  },
  {
    id: '2',
    restaurant_id: 'demo',
    category: 'hamburguer',
    name: 'Bacon Crunch',
    description: 'Smash, bacon crocante, alface, tomate e maionese defumada.',
    price: 36.5,
    image_url:
      'https://images.unsplash.com/photo-1553979459-b22240ba732d?w=800&q=80',
    video_url: null,
    ingredients: ['Carne', 'Bacon', 'Alface', 'Tomate', 'Maionese defumada', 'Pão'],
  },
  {
    id: '3',
    restaurant_id: 'demo',
    category: 'bebidas',
    name: 'Limonada Rosa',
    description: 'Limão siciliano, frutas vermelhas e hortelã.',
    price: 12,
    image_url:
      'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9e?w=800&q=80',
    video_url: null,
    ingredients: ['Limão siciliano', 'Frutas vermelhas', 'Hortelã', 'Água com gás'],
  },
  {
    id: '4',
    restaurant_id: 'demo',
    category: 'bebidas',
    name: 'Cold Brew',
    description: 'Café extraído a frio, servido com gelo.',
    price: 14.5,
    image_url:
      'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',
    video_url: null,
  },
];
