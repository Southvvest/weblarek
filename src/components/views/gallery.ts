import { Component } from "../base/component";

export class Gallery extends Component<unknown> {
    constructor(container: HTMLElement) {
        super(container);
    }
    set catalog(items: HTMLElement[]) {
        this.container.replaceChildren(...items);
    }
}