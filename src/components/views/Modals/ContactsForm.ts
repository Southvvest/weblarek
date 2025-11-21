import { Component } from "../../base/Component";
import { IBuyer } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class ContactsForm extends Component<Partial<IBuyer>> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.container.addEventListener('submit', (e) => e.preventDefault());

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('.button', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.emailInput.addEventListener('input', () => {
            this.validate();
        });

        this.phoneInput.addEventListener('input', () => {
            this.validate();
        });

        this.submitButton.addEventListener('click', () => {
            if (this.validate()) {
                const email = this.emailInput.value;
                const phone = this.phoneInput.value;
                this.events.emit('contacts:submit', { email, phone });
            }
        });
    }

    private validate(): boolean {
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        const errors: string[] = [];
        if (!email) {
            errors.push('Укажите email');
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            errors.push('Неверный формат email');
        }
        if (!phone) {
            errors.push('Укажите телефон');
        } else if (!/^\+7?\d{11}$/.test(phone)) {
            errors.push('Неверный формат телефона (только цифры, +7 в начале, 10 цифр далее)');
        }
        this.errorsElement.textContent = errors.join('; ');
        this.submitButton.disabled = errors.length > 0;
        return errors.length === 0;
    }

    render(data?: Partial<IBuyer>): HTMLElement {
        if (data) {
            if (data.email !== undefined) {
                this.emailInput.value = data.email;
            }
            if (data.phone !== undefined) {
                this.phoneInput.value = data.phone;
            }
            this.validate();
        }
        return this.container;
    }
}