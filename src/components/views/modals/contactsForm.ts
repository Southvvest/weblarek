import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { Form } from "./form";
import { ContactsFormData } from "../../../types";

export class ContactsForm extends Form<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events, 'contacts:submit');

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

        this.emailInput.addEventListener('blur', () => {
            const email = this.emailInput.value;
            this.events.emit('buyer:email', { email });
        });

        this.phoneInput.addEventListener('blur', () => {
            const phone = this.phoneInput.value;
            this.events.emit('buyer:phone', { phone });
        });
    }

    set email(value: string) {
        this.emailInput.value = value;
    }

    set phone(value: string) {
        this.phoneInput.value = value;
    }

    render(data?: ContactsFormData): HTMLElement {
        super.render(data);
        return this.container;
    }
}
