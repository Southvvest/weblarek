import { ensureElement } from "../../../utils/utils";

export class Modal {
    protected modal: HTMLElement;
    protected closeButton: HTMLElement;

    constructor(selector: string) {
        this.modal = ensureElement(selector);
        this.closeButton = ensureElement<HTMLElement>('.modal__close', this.modal);
        this.closeButton.addEventListener('click', () => this.close());

        // Закрытие по overlay (проверка target внутри container)
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });
    }

    set contentElement(element: HTMLElement) {
        const contentSlot = ensureElement<HTMLElement>('.modal__content', this.modal);
        contentSlot.innerHTML = '';
        contentSlot.append(element);
    }

    open(): void {
        this.modal.classList.add('modal_active');
        document.body.style.overflow = 'hidden';
    }

    close(): void {
        this.modal.classList.remove('modal_active');
        document.body.style.overflow = '';
        const contentSlot = ensureElement<HTMLElement>('.modal__content', this.modal);
        contentSlot.innerHTML = ''; // Очистка содержимого
    }
}
