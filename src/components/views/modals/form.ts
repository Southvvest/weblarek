import { ensureElement } from "../../../utils/utils";
import { Component } from "../../base/component";

export abstract class Form<T extends { errors: string; valid: boolean }> extends Component<T> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected submitButtonSelector: string = '.button';

    constructor(container: HTMLElement) {
        super(container);
        this.submitButton = ensureElement<HTMLButtonElement>(this.submitButtonSelector, this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }
}