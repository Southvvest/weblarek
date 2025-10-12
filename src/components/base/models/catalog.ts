// Определение интерфейса IProduct
import { IProduct } from "../../../types";

export class Catalog {
  private products: IProduct[] = [];
  private selectProduct: IProduct | null = null;

  // Конструктор без параметров
  constructor() {}

  // Устанавливает массив товаров
  public setProducts(products: IProduct[]): void {
    this.products = products;
  }

  // Возвращает текущий массив товаров
  public getProducts(): IProduct[] {
    return this.products;
  }

  // Находит и возвращает товар по id, или null, если не найден
  public getProductById(id: string): IProduct | null {
    const product = this.products.find(p => p.id === id);
    return product || null;
  }

  // Устанавливает выбранный товар для отображения
  public setSelectedProduct(product: IProduct): void {
    this.selectProduct = product;
  }

  // Возвращает выбранный товар
  public getSelectedProduct(): IProduct | null {
    return this.selectProduct;
  }
}