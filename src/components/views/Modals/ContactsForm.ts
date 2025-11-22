import { Component } from "../../base/component";
import { IBuyer, IValidationError } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";

type ContactsFormData = Partial<IBuyer> & { errors?: IValidationError };

export class ContactsForm extends Component<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('.button', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('contacts:submit');
        });

        this.emailInput.addEventListener('input', () => {
            const email = this.emailInput.value;
            this.events.emit('buyer:email', { email });
        });

        this.phoneInput.addEventListener('input', () => {
            const phone = this.phoneInput.value;
            this.events.emit('buyer:phone', { phone });
        });
    }

    render(data?: ContactsFormData): HTMLElement {
        if (data) {
            if (data.email !== undefined) {
                this.emailInput.value = data.email;
            }
            if (data.phone !== undefined) {
                this.phoneInput.value = data.phone;
            }
            // Отображение ошибок (только релевантных для формы контактов)
            const errors = data.errors || {};
            const relevantErrors: Partial<IValidationError> = {};
            if (errors.email) relevantErrors.email = errors.email;
            if (errors.phone) relevantErrors.phone = errors.phone;
            this.errorsElement.textContent = Object.values(relevantErrors).join('; ');
            // Блокировка кнопки submit
            this.submitButton.disabled = Object.keys(relevantErrors).length > 0;
        }
        return this.container;
    }
}
