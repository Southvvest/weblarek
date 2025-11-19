import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
// import { API_URL } from "../../../utils/constants";

export class CardBasket extends Card {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this.deleteButton.addEventListener('click', () => {
            const id = this.container.dataset.id;
            if (id) {
                this.events.emit('basket:remove', { id });
            }
        });
    }

    set index(value: number) {
        this.indexElement.textContent = value.toString();
    }

    render(data: Partial<IProduct & { index: number }>): HTMLElement {
        const product = data as IProduct;
        const rendered = super.render(product);
        if (data.index !== undefined) this.index = data.index;
        return rendered;
    }
}
