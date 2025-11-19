import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class CardPreview extends Card {
    protected descriptionElement: HTMLElement;
    protected addToBasketButton: HTMLButtonElement;
    protected _product: IProduct | null = null; // Внутреннее свойство для хранения продукта
    protected _inBasket: boolean = false;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.addToBasketButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

        this.addToBasketButton.addEventListener('click', this.handleButtonClick.bind(this));
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set inBasket(value: boolean) {
        this._inBasket = value;
        this.updateButton();
    }

    protected handleButtonClick() {
        if (this._product?.price === null) return;
        if (this._inBasket) {
            this.events.emit('basket:remove', { id: this._product!.id });
            this._inBasket = false;
            this.updateButton();
        } else {
            this.events.emit('basket:add', { id: this._product!.id });
        }
    }

    protected updateButton() {
        if (this._product?.price === null) {
            this.addToBasketButton.textContent = 'Недоступно';
            this.addToBasketButton.disabled = true;
        } else if (this._inBasket) {
            this.addToBasketButton.textContent = 'Удалить';
            this.addToBasketButton.disabled = false;
        } else {
            this.addToBasketButton.textContent = 'В корзину';
            this.addToBasketButton.disabled = false;
        }
    }

    render(product: IProduct): HTMLElement {
        this._product = product; // Сохраняем продукт внутренне
        const rendered = super.render(product);
        this.description = product.description;
        this._inBasket = false; // Сброс, будет установлено через set inBasket в main.ts
        this.updateButton();
        return rendered;
    }
}
