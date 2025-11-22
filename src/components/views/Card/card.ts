import { Component } from "../../base/Component";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

export class Card extends Component<IProduct> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected events?: IEvents; // Для эмитов в наследниках

    constructor(container: HTMLElement, events?: IEvents) {
        super(container);
        this.events = events;

        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
    }
}