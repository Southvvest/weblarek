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

// import { ensureElement } from "../../utils/utils";

export class Gallery {
    private catalogElement: HTMLElement;

    // Конструктор принимает HTMLElement
    constructor(container: HTMLElement) {
        this.catalogElement = container;
    }

    set catalog(items: HTMLElement[]) {
        this.catalogElement.replaceChildren(...items);
    }
}




