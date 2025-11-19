// export class Gallery {
//     // Приватное поле для вывода карточек
//     private catalogElement: HTMLElement;

//     // Конструктор принимает HTMLElement для галереи
//     constructor(catalogElement: HTMLElement) {
//         this.catalogElement = catalogElement;
//     }

//     // Метод для добавления карточек в каталог
//     set catalog(items: HTMLElement[]) {
//         this.catalogElement.replaceChildren(...items);
//     }
// }

import { ensureElement } from "../../../utils/utils";

export class Gallery {
    private catalogElement: HTMLElement;

    // Конструктор принимает string (селектор), использует ensureElement внутри
    constructor(selector: string) {
        this.catalogElement = ensureElement<HTMLElement>(selector);
    }

    set catalog(items: HTMLElement[]) {
        this.catalogElement.innerHTML = '';
        items.forEach(item => this.catalogElement.appendChild(item));
    }
}



