import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";

export class CardPreview extends Card {
    protected descriptionElement: HTMLElement;
    protected addToBasketButton: HTMLButtonElement;
    private id: string = ''; // Приватное поле без публичного доступа
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;

    constructor(container: HTMLElement, events?: IEvents) {
        super(container, events);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.addToBasketButton = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);

        this.addToBasketButton.addEventListener('click', this.handleButtonClick.bind(this));
    }

    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    set image(value: string) {
        this.setImage(this.imageElement, CDN_URL + value, this.titleElement.textContent || '');
    }

    set category(value: string) {
        this.categoryElement.textContent = value;
        const className = categoryMap[value as keyof typeof categoryMap];
        if (className) {
            this.categoryElement.classList.add(className);
        }
    }

    protected handleButtonClick() {
        if (this.addToBasketButton.disabled) return;
        if (this.priceElement.textContent === 'Бесценно') return;
        const isInBasket = this.addToBasketButton.textContent === 'Удалить';
        if (isInBasket) {
            this.events!.emit('basket:remove', { id: this.id });
        } else {
            this.events!.emit('basket:add', { id: this.id });
        }
    }

    public updateButton(value: boolean) { 
        if (this.priceElement.textContent === 'Бесценно') {
            this.addToBasketButton.textContent = 'Недоступно';
            this.addToBasketButton.disabled = true;
        } else if (value) {
            this.addToBasketButton.textContent = 'Удалить';
            this.addToBasketButton.disabled = false;
        } else {
            this.addToBasketButton.textContent = 'В корзину';
            this.addToBasketButton.disabled = false;
        }
    }

    render(product: IProduct, inBasket: boolean = false): HTMLElement {
        this.id = product.id;
        super.render(product);
        this.description = product.description;
        this.image = product.image;
        this.category = product.category;
        this.updateButton(inBasket);
        return this.container;
    }
}