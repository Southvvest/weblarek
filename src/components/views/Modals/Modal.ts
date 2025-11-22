import { Component } from "../../base/component";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

export class Modal extends Component<unknown> {
    protected contentSlot: HTMLElement;
    protected closeButton: HTMLElement;
    protected events?: IEvents;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this.events = events;
        this.contentSlot = ensureElement<HTMLElement>('.modal__content', this.container);
        this.closeButton = ensureElement<HTMLElement>('.modal__close', this.container);

        this.closeButton.addEventListener('click', () => this.close());

        // Закрытие по overlay (проверка target внутри container)
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.close();
        });
    }

    set contentElement(element: HTMLElement) {
        this.contentSlot.innerHTML = '';
        this.contentSlot.append(element);
    }

    open(): void {
        this.container.classList.add('modal_active');
        this.events?.emit('modal:open');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.events?.emit('modal:close');
        this.contentSlot.innerHTML = ''; // Очистка содержимого
    }
}
