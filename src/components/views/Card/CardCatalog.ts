import { Card } from "./card";
import { IProduct } from "../../../types";
import { IEvents } from "../../base/Events";
import { categoryMap } from "../../../utils/constants";

export class CardCatalog extends Card {
    constructor(container: HTMLElement, events: IEvents) {
        super(container, events);

        // Клик-обработчик только в этом классе
        this.container.addEventListener('click', () => {
            const id = this.container.dataset.id;
            if (id) {
                this.events.emit('card:select', { id });
            }
        });
    }

    // Переопределение для стилей категории
    set category(value: string) {
        super.category = value;  // Правильный вызов setter родителя
        const className = categoryMap[value as keyof typeof categoryMap];
        if (className && this.categoryElement) {
            this.categoryElement.classList.add(className);
        }
    }

    // render без изменений (наследует)
    render(product: IProduct): HTMLElement {
        return super.render(product);
    }
}
