import { IBuyer, TPayment, IValidationError } from "../../types";
import { IEvents } from "../base/Events"; // Добавлен импорт

export class Buyer {
  private payment: TPayment = '';
  private address: string = '';
  private email: string = '';
  private phone: string = '';

  constructor(private events: IEvents) { // Добавлен конструктор с events
    // Уже инициализировали при объявлении полей
  }

  // Обновление данных (частично)
  public setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    this.events.emit('buyer:changed', this.getData()); // Добавлен эмит события
  }

  // Получение всех данных в виде объекта
  public getData(): IBuyer {
    return {
      payment: this.payment,
      address: this.address,
      email: this.email,
      phone: this.phone,
    };
  }

  // Очистка всех данных (установка пустых значений)
  public clearData(): void {
    this.payment = '';
    this.address = '';
    this.email = '';
    this.phone = '';
    this.events.emit('buyer:changed', this.getData()); // Добавлен эмит события
  }

  // Валидация данных
  public validate(): IValidationError {
    const errors: IValidationError = {};

    if (!this.payment) {
      errors.payment = 'Не выбран вид оплаты';
    }
    if (!this.address.trim()) {
      errors.address = 'Укажите адрес доставки';
    }
    if (!this.email.trim()) {
      errors.email = 'Укажите email';
    }
    if (!this.phone.trim()) {
      errors.phone = 'Укажите телефон';
    }

    return errors;
  }
}