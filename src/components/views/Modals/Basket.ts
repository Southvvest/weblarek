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

    render(data: BasketData): HTMLElement {
        if (data.items.length === 0) {
            this.listElement.innerHTML = '<p>Корзина пуста</p>';
            this.orderButton.disabled = true;
        } else {
            this.orderButton.disabled = false;
            const cards: HTMLElement[] = data.items.map((item, index) => {
                const cardContainer = cloneTemplate('#card-basket');
                const cardBasket = new CardBasket(cardContainer, this.events);
                return cardBasket.render({ ...item, index: index + 1 });
            });
            this.listElement.replaceChildren(...cards);
        }
        this.total = data.total;
        return this.container;
    }
}
