import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";
import { categoryMap } from "../../../utils/constants";

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
        this.imageElement.src = value;
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
}
