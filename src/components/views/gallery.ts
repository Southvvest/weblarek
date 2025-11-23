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