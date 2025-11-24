import { Card } from "./card";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";

type categoryKey = keyof typeof categoryMap;

export class CardCatalog extends Card {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;

    constructor(container: HTMLElement, events: IEvents, protected actions?: {onClick?: () => void}) {
        super(container, events);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);

        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick);
        }
    }

    set image(value: string) {
        this.imageElement.src = CDN_URL + value;
        this.imageElement.alt = this.titleElement.textContent || '';
    }

    // Переопределение для стилей категории
    set category(value: string) {
        this.categoryElement.textContent = value;
        for (const key in categoryMap) {
            this.categoryElement.classList.toggle(
                categoryMap[key as categoryKey],
                key === value
            );
        }
    }
}
