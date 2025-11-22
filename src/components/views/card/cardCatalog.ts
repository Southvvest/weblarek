import { Card } from "../card/card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";

export class CardCatalog extends Card {
    protected id: string = '';
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);

        // Клик-обработчик только в этом классе
        this.container.addEventListener('click', () => {
            const id = this.id;
            if (id) {
                this.events!.emit('card:select', { id });
            }
        });
    }

    set image(value: string) {
        this.imageElement.src = CDN_URL + value;
        this.imageElement.alt = this.titleElement.textContent || '';
    }

    // Переопределение для стилей категории
    set category(value: string) {
        this.categoryElement.textContent = value;
        const className = categoryMap[value as keyof typeof categoryMap];
        if (className) {
            this.categoryElement.classList.add(className);
        }
    }

    render(product: IProduct): HTMLElement {
        this.id = product.id;
        super.render(product);
        this.image = product.image;
        this.category = product.category;
        return this.container;
    }
}