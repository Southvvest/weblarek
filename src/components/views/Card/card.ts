import { Component } from "../../base/Component";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";

export class Card extends Component<IProduct> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected imageElement: HTMLImageElement | null;
    protected categoryElement: HTMLElement | null;
    protected events: IEvents; // Для emit в наследниках

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.titleElement = this.container.querySelector('.card__title') as HTMLElement;
        this.priceElement = this.container.querySelector('.card__price') as HTMLElement;
        this.imageElement = this.container.querySelector('.card__image') as HTMLImageElement;
        this.categoryElement = this.container.querySelector('.card__category') as HTMLElement;
    }

    set title(value: string) {
        if (this.titleElement) {
            this.titleElement.textContent = value;
        }
    }

    set price(value: number | null) {
        if (this.priceElement) {
            this.priceElement.textContent = value !== null ? `${value} синапсов` : 'Бесценно';
        }
    }

    set image(value: string) {
        if (this.imageElement) {
            this.setImage(this.imageElement, value, this.titleElement?.textContent || '');
        }
    }

    set category(value: string) {
        if (this.categoryElement) {
            this.categoryElement.textContent = value;
        }
    }

    // Добавлено для установки продукта (используется в main.ts для CardPreview)
    set product(value: IProduct) {
        this.render(value); // Рендерит данные
    }

    render(product: IProduct): HTMLElement {
        this.container.dataset.id = product.id; // Для взаимодействия (id не храним, но используем)
        this.title = product.title;
        this.price = product.price;
        this.image = product.image;
        this.category = product.category;
        return this.container;
    }
}
