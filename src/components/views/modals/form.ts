import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/component";
import { IEvents } from "../../base/events";

export abstract class Form<T extends { errors?: string; valid: boolean }> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected events: IEvents;
    protected submitEvent: string;

    constructor(container: HTMLElement, events: IEvents, submitEvent: string) {
        super(container);
        this.events = events;
        this.submitEvent = submitEvent;
        this.submitButton = ensureElement<HTMLButtonElement>('.button', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit(this.submitEvent);
        });
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }
}
