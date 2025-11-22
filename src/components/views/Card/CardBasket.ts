import { Card } from "./card";
// import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
// import { API_URL } from "../../../utils/constants";

export class CardBasket extends Card {
    protected indexElement: HTMLElement;
    protected deleteButton: HTMLButtonElement;
    protected id: string = '';

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.events!.emit('basket:remove', { id: this.id });
        });
    }

    set index(value: number) {
        this.indexElement.textContent = value.toString();
    }
}