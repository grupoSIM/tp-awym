import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1095;"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="toast show align-items-center border-0 shadow-lg rounded-3 mb-2 text-white"
          [class.bg-success]="toast.tipo === 'success'"
          [class.bg-danger]="toast.tipo === 'danger'"
          [class.bg-warning]="toast.tipo === 'warning'"
          [class.bg-info]="toast.tipo === 'info'"
          role="status"
        >
          <div class="d-flex align-items-center">
            <div class="toast-body d-flex align-items-center gap-2 py-3 px-3">
              <span class="fs-5 fw-bold" aria-hidden="true">
                {{ toast.tipo === 'success' ? '✓' : toast.tipo === 'danger' ? '⚠' : 'ℹ' }}
              </span>
              <span class="fw-medium">{{ toast.mensaje }}</span>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-3 m-auto"
              aria-label="Cerrar notificación"
              (click)="remover(toast.id)"
            ></button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  toasts = this.toastService.toasts;

  remover(id: number): void {
    this.toastService.remove(id);
  }
}
