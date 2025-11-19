import { Component } from "../../base/Component";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { cloneTemplate } from "../../../utils/utils";
import { CardBasket } from "../Card/CardBasket";

type BasketData = {
    items: IProduct[];
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

    set items(items: IProduct[]) {
        this.listElement.innerHTML = '';
        items.forEach((item, index) => {
            const basketItemContainer = cloneTemplate('#card-basket');
            const basketItem = new CardBasket(basketItemContainer, this.events);
            basketItem.render({ ...item, index: index + 1 });
            this.listElement.append(basketItemContainer);
        });
        this.orderButton.disabled = items.length === 0;
    }

    render(data: BasketData): HTMLElement {
        this.items = data.items;
        this.total = data.total;
        return this.container;
    }
}
