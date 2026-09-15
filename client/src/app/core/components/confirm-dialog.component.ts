import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../services/confirm.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (estado().abierto) {
      <div
        class="modal fade show d-block"
        style="background-color: rgba(0,0,0,0.5); z-index: 1080;"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmDialogTitle"
        (click)="cancelar()"
      >
        <div class="modal-dialog modal-dialog-centered" role="document" (click)="$event.stopPropagation()">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-0 pb-0">
              <h2
                class="modal-title h5 fw-bold"
                [class.text-danger]="estado().opciones.tipo === 'danger'"
                [class.text-warning]="estado().opciones.tipo === 'warning'"
                [class.text-success]="estado().opciones.tipo === 'success'"
                [class.text-primary]="!estado().opciones.tipo || estado().opciones.tipo === 'primary'"
                id="confirmDialogTitle"
              >
                {{ estado().opciones.titulo }}
              </h2>
              <button
                type="button"
                class="btn-close"
                (click)="cancelar()"
                aria-label="Cerrar diálogo"
              ></button>
            </div>
            <div class="modal-body py-3">
              <p class="mb-0 text-secondary">
                {{ estado().opciones.mensaje }}
              </p>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm px-3"
                (click)="cancelar()"
              >
                {{ estado().opciones.textoCancelar }}
              </button>
              <button
                type="button"
                class="btn btn-sm px-3"
                [class.btn-danger]="estado().opciones.tipo === 'danger'"
                [class.btn-warning]="estado().opciones.tipo === 'warning'"
                [class.btn-success]="estado().opciones.tipo === 'success'"
                [class.btn-primary]="!estado().opciones.tipo || estado().opciones.tipo === 'primary'"
                (click)="confirmar()"
              >
                {{ estado().opciones.textoConfirmar }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  private confirmService = inject(ConfirmService);
  estado = this.confirmService.estado;

  @HostListener('window:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (this.estado().abierto) {
      event.preventDefault();
      this.cancelar();
    }
  }

  confirmar(): void {
    this.confirmService.responder(true);
  }

  cancelar(): void {
    this.confirmService.responder(false);
  }
}
