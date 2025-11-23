import { Component } from "../../base/component";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { cloneTemplate } from "../../../utils/utils";
import { CardBasket } from "../card/cardBasket";

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

    render(data: BasketData): HTMLElement {
        if (data.items.length === 0) {
            this.listElement.innerHTML = '<p>Корзина пуста</p>';
            this.orderButton.disabled = true;
        } else {
            this.orderButton.disabled = false;
            this.listElement.innerHTML = ''; // Очистка списка
            data.items.forEach((item, index) => {
                const cardContainer = cloneTemplate('#card-basket');
                const card = new CardBasket(cardContainer, this.events);
                card.render({ ...item, index: index + 1 });
                this.listElement.append(cardContainer);
            });
        }
        this.total = data.total;
        return this.container;
    }
}
