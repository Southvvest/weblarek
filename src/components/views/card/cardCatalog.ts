import { Card } from "./card";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";

type categoryKey = keyof typeof categoryMap;

export type TCardCatalog = Pick<IProduct, 'title' | 'price' | 'category' | 'image'>;

export class CardCatalog extends Card<TCardCatalog> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;

    constructor(container: HTMLElement, protected actions?: {onClick?: () => void}) {
        super(container);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);

        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick);
        }
    }

    set image(value: string) {
        this.setImage(this.imageElement, CDN_URL + value, this.titleElement.textContent || '');
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
