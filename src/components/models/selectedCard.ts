import { IProduct } from "../../types";
import { IEvents } from '../base/events';

export class SelectedCart {
  private _items: IProduct[] = [];

  // Конструктор с events
  constructor(private events: IEvents) {}

  // Получение всех товаров в корзине
  public getItems(): IProduct[] {
    return this._items;
  }

  // Добавление товара в корзину
  public addItem(product: IProduct): void {
    if (product.price !== null && !this.hasItem(product.id)) { // Добавлена проверка на price и отсутствие дубликатов
      this._items.push(product);
      this.events.emit('basket:changed'); // Добавлен эмит события
    }
  }

  // Удаление товара из корзины по id
  public removeItem(id: string): void {
    this._items = this._items.filter(item => item.id !== id);
    this.events.emit('basket:changed'); // Добавлен эмит события
  }

  // Очистка корзины
  public clear(): void {
    this._items = [];
    this.events.emit('basket:changed'); // Добавлен эмит события
  }

  // Расчет общей стоимости товаров
  public getTotalPrice(): number {
    return this._items.reduce((total, item) => {
      if (item.price !== null) {
        return total + item.price;
      }
      return total;
    }, 0);
  }

  // Количество товаров в корзине
  public getItemCount(): number {
    return this._items.length;
  }

  // Проверка, есть ли товар с определенным id в корзине
  public hasItem(id: string): boolean {
    return this._items.some(item => item.id === id);
  }

  // Геттеры для совместимости с IBasket
  public get items(): IProduct[] {
    return this._items;
  }

  public get total(): number {
    return this.getTotalPrice();
  }
}
