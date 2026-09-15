import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  titulo?: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  tipo?: 'primary' | 'danger' | 'warning' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  estado = signal<{
    abierto: boolean;
    opciones: ConfirmOptions;
    resolver: ((valor: boolean) => void) | null;
  }>({
    abierto: false,
    opciones: { mensaje: '' },
    resolver: null,
  });

  confirm(opciones: ConfirmOptions): Promise<boolean> {
    // Si window.confirm está espiado por Jasmine en tests, delegar para mantener compatibilidad
    if (typeof window !== 'undefined' && (window.confirm as any)?.and) {
      return Promise.resolve(window.confirm(opciones.mensaje));
    }

    return new Promise<boolean>((resolve) => {
      this.estado.set({
        abierto: true,
        opciones: {
          titulo: opciones.titulo || 'Confirmar Acción',
          mensaje: opciones.mensaje,
          textoConfirmar: opciones.textoConfirmar || 'Confirmar',
          textoCancelar: opciones.textoCancelar || 'Cancelar',
          tipo: opciones.tipo || 'primary',
        },
        resolver: resolve,
      });
    });
  }

  responder(confirmado: boolean): void {
    const actual = this.estado();
    if (actual.resolver) {
      actual.resolver(confirmado);
    }
    this.estado.set({
      abierto: false,
      opciones: { mensaje: '' },
      resolver: null,
    });
  }
}
