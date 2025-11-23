import { Component } from "../../base/component";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

type BasketData = {
    items: HTMLElement[];
    total: number;
};

export class Basket extends Component<BasketData> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected orderButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.orderButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.orderButton.addEventListener('click', () => {
            this.events.emit('basket:order');
        });
    }

    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }

    render(data: BasketData): HTMLElement {
        if (data.items.length === 0) {
            this.listElement.innerHTML = '<p>Корзина пуста</p>';
            this.orderButton.disabled = true;
        } else {
            this.orderButton.disabled = false;
            this.listElement.replaceChildren(...data.items);
        }
        this.total = data.total;
        return this.container;
    }
}