import { Card } from "./card";
import { ensureElement } from "../../../utils/utils";
import { categoryMap, CDN_URL } from "../../../utils/constants";
import { IProduct } from "../../../types";

export type TCardPreview = Pick<IProduct, 'title' | 'price' | 'description' | 'image' | 'category'> & { buttonText: string; buttonDisabled: boolean };

export class CardPreview extends Card<TCardPreview> {
    protected descriptionElement: HTMLElement;
    protected addToBasketButton: HTMLButtonElement;
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;

    constructor(container: HTMLElement, protected actions?: {onToggle?: () => void}) {
        super(container);

        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.addToBasketButton = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);

        this.addToBasketButton.addEventListener('click', () => {
            this.actions?.onToggle?.();
        });
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
}
