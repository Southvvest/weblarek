import { Component } from "../../base/component";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

export class CardBasket extends Component<IProduct & { index: number }> {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);

        this.deleteButton.addEventListener('click', () => {
            const id = this.deleteButton.dataset.id;
            if (id) {
                this.events.emit('basket:remove', { id });
            }
        });
    }

    set index(value: number) {
        this.indexElement.textContent = value.toString();
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
    }

    render(data: IProduct & { index: number }): HTMLElement {
        super.render(data);
        this.deleteButton.dataset.id = data.id;
        return this.container;
    }
}
