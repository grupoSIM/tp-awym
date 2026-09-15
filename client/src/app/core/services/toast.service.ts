import { Injectable, signal } from '@angular/core';

export interface ToastItem {
  id: number;
  mensaje: string;
  tipo: 'success' | 'danger' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastItem[]>([]);
  private nextId = 1;

  show(mensaje: string, tipo: 'success' | 'danger' | 'info' | 'warning' = 'success', duracionMs = 5000): void {
    const id = this.nextId++;
    this.toasts.update((actual) => [...actual, { id, mensaje, tipo }]);

    setTimeout(() => {
      this.remove(id);
    }, duracionMs);
  }

  success(mensaje: string, duracionMs = 5000): void {
    this.show(mensaje, 'success', duracionMs);
  }

  error(mensaje: string, duracionMs = 6000): void {
    this.show(mensaje, 'danger', duracionMs);
  }

  remove(id: number): void {
    this.toasts.update((actual) => actual.filter((t) => t.id !== id));
  }
}
