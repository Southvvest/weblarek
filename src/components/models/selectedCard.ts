// Используем тот же интерфейс IProduct, который вы предоставили
import { IProduct } from "../../types";

export class SelectedCart {
  private items: IProduct[] = [];

  // Конструктор без параметров
  constructor() {}

  // Получение всех товаров в корзине
  public getItems(): IProduct[] {
    return this.items;
  }

  // Добавление товара в корзину
  public addItem(product: IProduct): void {
    this.items.push(product);
  }

  // Удаление товара из корзины по объекту
  public removeItem(product: IProduct): void {
    this.items = this.items.filter(item => item.id !== product.id);
  }

  // Очистка корзины
  public clear(): void {
    this.items = [];
  }

  // Расчет общей стоимости товаров
  public getTotalPrice(): number {
    return this.items.reduce((total, item) => {
      if (item.price !== null) {
        return total + item.price;
      }
      return total;
    }, 0);
  }

  // Количество товаров в корзине
  public getItemCount(): number {
    return this.items.length;
  }

  // Проверка, есть ли товар с определенным id в корзине
  public hasItem(id: string): boolean {
    return this.items.some(item => item.id === id);
  }
}