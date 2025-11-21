import { Component } from "../../base/Component";
import { TPayment, IBuyer } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

export class OrderForm extends Component<Partial<IBuyer>> {
    protected paymentButtons: NodeListOf<HTMLButtonElement>;
    protected addressInput: HTMLInputElement;
    protected nextButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.container.addEventListener('submit', (e) => e.preventDefault());

        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this.nextButton = ensureElement<HTMLButtonElement>('.order__button', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.paymentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const clickedButton = e.target as HTMLButtonElement;
                this.paymentButtons.forEach(b => b.classList.remove('button_alt-active'));
                clickedButton.classList.add('button_alt-active');
                this.validate();
            });
        });

        this.addressInput.addEventListener('input', () => {
            this.validate();
        });

        this.nextButton.addEventListener('click', () => {
            if (this.validate()) {
                const payment = (this.container.querySelector('.button_alt-active') as HTMLButtonElement)?.name as TPayment || '';
                const address = this.addressInput.value;
                this.events.emit('order:submit', { payment, address });
            }
        });
    }

    private validate(): boolean {
        const payment = (this.container.querySelector('.button_alt-active') as HTMLButtonElement)?.name as TPayment || '';
        const address = this.addressInput.value.trim();
        const errors: string[] = [];
        if (!payment) errors.push('Не выбран способ оплаты');
        if (!address) errors.push('Укажите адрес доставки');
        this.errorsElement.textContent = errors.join('; ');
        this.nextButton.disabled = errors.length > 0;
        return errors.length === 0;
    }

    render(data?: Partial<IBuyer>): HTMLElement {
        if (data) {
            if (data.payment) {
                this.paymentButtons.forEach(button => button.classList.remove('button_alt-active'));
                const activeButton = Array.from(this.paymentButtons).find(button => button.name === data.payment);
                if (activeButton) {
                    activeButton.classList.add('button_alt-active');
                }
            }
            if (data.address !== undefined) {
                this.addressInput.value = data.address;
            }
            this.validate();
        }
        return this.container;
    }
}