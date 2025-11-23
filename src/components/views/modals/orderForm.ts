import { Component } from "../../base/component";
import { TPayment, IBuyer, IValidationError } from "../../../types";
import { IEvents } from "../../base/events";
import { ensureElement } from "../../../utils/utils";
import { Form } from "./form";
import { OrderFormData } from "../../../types";

export class OrderForm extends Form<OrderFormData> {
    protected paymentButtons: NodeListOf<HTMLButtonElement>;
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container, events, 'order:submit');

        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const payment = button.name as TPayment;
                this.events.emit('buyer:payment', { payment });
            });
        });

        this.addressInput.addEventListener('input', () => {
            const address = this.addressInput.value;
            this.events.emit('buyer:address', { address });
        });
    }

    set payment(value: TPayment) {
        this.paymentButtons.forEach(button => button.classList.remove('button_alt-active'));
        if (value) {
            const activeButton = Array.from(this.paymentButtons).find(button => button.name === value);
            if (activeButton) {
                activeButton.classList.add('button_alt-active');
            }
        }
    }

    set address(value: string) {
        this.addressInput.value = value;
    }

    render(data?: OrderFormData): HTMLElement {
        super.render(data);
        return this.container;
    }
}
