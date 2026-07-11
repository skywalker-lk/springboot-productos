// Review Types (Gentleman Programming)
export interface Review {
  _id: string;
  productoId: string;
  usuario: {
    _id: string;
    nombre: string;
  };
  rating: number; // 1-5 estrellas
  comentario: string;
  fecha: string; // ISO date
}

export interface ReviewsResponse {
  total: number;
  reviews: Review[];
}

// Type Guard
export function isReview(value: unknown): value is Review {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'productoId' in value &&
    'rating' in value &&
    'comentario' in value
  );
}
