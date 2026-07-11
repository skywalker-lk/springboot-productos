import { useCallback, useEffect, useState } from 'react';
import { API_BASE } from '../services/api';

export interface Notificacion {
  tipo: string;
  titulo: string;
  mensaje: string;
  link?: string;
}

export function useNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [ultima, setUltima] = useState<Notificacion | null>(null);

  useEffect(() => {
    const url = `${API_BASE}/notificaciones/suscripcion`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('notificacion', (event) => {
      try {
        const data: Notificacion = JSON.parse(event.data);
        setNotificaciones((prev) => [data, ...prev].slice(0, 50));
        setUltima(data);
      } catch {
        // ignore parse errors
      }
    });

    eventSource.onerror = () => {
      // Reconnect is automatic with EventSource
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const limpiarUltima = useCallback(() => setUltima(null), []);

  return { notificaciones, ultima, limpiarUltima };
}
