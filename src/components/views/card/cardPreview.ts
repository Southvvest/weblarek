import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";

export class CardPreview extends Card {
    protected descriptionElement: HTMLElement;
    protected addToBasketButton: HTMLButtonElement;
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

    set buttonText(value: string) {
        this.addToBasketButton.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.addToBasketButton.disabled = value;
    }

    protected handleButtonClick() {
        const id = this.container.dataset.id;
        if (id) {
            this.events!.emit('basket:toggle', { id }); // Эмит toggle без внутренней логики
        }
    }

    // public updateButton(value: boolean) {
    //     Логика теперь в сеттерах, вызываемых через render()
    //     if (this.priceElement.textContent === 'Бесценно') {
    //         this.addToBasketButton.textContent = 'Недоступно';
    //         this.addToBasketButton.disabled = true;
    //     } else if (value) {
    //         this.addToBasketButton.textContent = 'Удалить';
    //         this.addToBasketButton.disabled = false;
    //     } else {
    //         this.addToBasketButton.textContent = 'В корзину';
    //         this.addToBasketButton.disabled = false;
    //     }
    // }

    render(data: IProduct & { inBasket?: boolean }): HTMLElement {
        const { inBasket = false, ...product } = data;
        super.render(product);
        this.container.dataset.id = product.id;
        // Логика кнопки через сеттеры, вызываемые Object.assign в super.render
        if (product.price === null) {
            this.buttonText = 'Недоступно';
            this.buttonDisabled = true;
        } else if (inBasket) {
            this.buttonText = 'Удалить';
            this.buttonDisabled = false;
        } else {
            this.buttonText = 'В корзину';
            this.buttonDisabled = false;
        }
        return this.container;
    }
}
