export type CategoryId = 'hamburguer' | 'bebidas';

export type OrderType = 'mesa' | 'viagem' | 'delivery' | 'retirada';

export type Product = {
  id: string;
  /** Igual ao slug do restaurante no painel / FK no Supabase */
  restaurant_id: string;
  /** Slug ou nome da categoria (livre para o admin) */
  category: string;
  name: string;
  description: string;
  price: number;
  /** URL da imagem principal (legacy) */
  image_url: string;
  /** URL opcional do vídeo principal (legacy) */
  video_url?: string | null;
  /** Alias amigável para imagem (para futura migração) */
  image?: string;
  /** Alias amigável para vídeo (para futura migração) */
  video?: string | null;
  /** Origem do vídeo: upload (Storage) ou link externo */
  videoType?: 'upload' | 'link';
  /** Data de criação (quando disponível no Supabase) */
  createdAt?: string;
  ingredients?: string[] | null;
};
