import { Component } from "../../base/component";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

interface ISuccessData {
    total: number;
}

export class OrderSuccess extends Component<ISuccessData> {
    protected closeButton: HTMLButtonElement;
    protected descriptionElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this.descriptionElement = ensureElement<HTMLElement>('.order-success__description', this.container);

        this.closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} синапсов`;
    }

    render(data?: Partial<ISuccessData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}
