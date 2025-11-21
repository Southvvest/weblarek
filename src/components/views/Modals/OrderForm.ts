import { Component } from "../../base/Component";
import { TPayment, IBuyer, IValidationError } from "../../../types";
import { IEvents } from "../../base/Events";
import { ensureElement } from "../../../utils/utils";

type OrderFormData = Partial<IBuyer> & { errors?: IValidationError };

export class OrderForm extends Component<OrderFormData> {
    protected paymentButtons: NodeListOf<HTMLButtonElement>;
    protected addressInput: HTMLInputElement;
    protected nextButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;

        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this.nextButton = ensureElement<HTMLButtonElement>('.order__button', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('order:submit');
        });

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

    render(data?: OrderFormData, errors?: IValidationError): HTMLElement {
        if (data) {
            if (data.address !== undefined) {
                this.addressInput.value = data.address;
            }
            // Установка активной кнопки оплаты
            this.paymentButtons.forEach(button => button.classList.remove('button_alt-active'));
            if (data.payment) {
                const activeButton = Array.from(this.paymentButtons).find(button => button.name === data.payment);
                if (activeButton) {
                    activeButton.classList.add('button_alt-active');
                }
            }
            // Отображение ошибок (только релевантных для формы заказа)
            const errors = data.errors || {};
            const relevantErrors: Partial<IValidationError> = {};
            if (errors.payment) relevantErrors.payment = errors.payment;
            if (errors.address) relevantErrors.address = errors.address;
            this.errorsElement.textContent = Object.values(relevantErrors).join('; ');
            // Блокировка кнопки submit
            this.nextButton.disabled = Object.keys(relevantErrors).length > 0;
        }
        return this.container;
    }
}