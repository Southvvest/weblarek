import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { Card } from "./card";

export class CardBasket extends Card {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents, protected actions?: {onDelete: () => void}) {
        super(container, events);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.actions?.onDelete();
        });
    }

    set index(value: number) {
        this.indexElement.textContent = value.toString();
    }

    render(data: IProduct & { index: number }): HTMLElement {
        this.title = data.title;
        this.price = data.price;
        this.index = data.index;
        return this.container;
    }
}
