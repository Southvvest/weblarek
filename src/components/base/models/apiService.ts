import { Api } from '../Api'; // Импорт класса Api
import { API_URL } from '../../../utils/constants'; // Импорт константы API_URL
import { IProduct, TPayment } from '../../../types'; // Импорт типов

export class ApiService {
  private api: Api; // Композиция: экземпляр Api для выполнения запросов

  constructor() {
    // Инициализация Api с базовым URL из константы
    this.api = new Api(API_URL);
  }

  // Метод для получения списка всех товаров
  // Делает GET-запрос на /product/ и возвращает массив товаров
  public async getProducts(): Promise<IProduct[]> {
    const data = await this.api.get<{ total: number; items: IProduct[] }>('/product/');
    return data.items; // Возвращаем только массив товаров
  }

  // Метод для получения товара по ID
  // Делает GET-запрос на /product/{id} и возвращает товар или null
  public async getProduct(id: string): Promise<IProduct | null> {
    try {
      const data = await this.api.get<IProduct | { error: string }>(`/product/${id}`);
      // Если в ответе есть ошибка (например, NotFound), возвращаем null
      if ('error' in data) {
        return null;
      }
      return data; // Возвращаем товар
    } catch {
      // В случае сетевой ошибки или другой проблемы возвращаем null
      return null;
    }
  }

  // Метод для отправки заказа
  // Делает POST-запрос на /order с данными о покупателе и товарах
  // Формат данных: { payment, address, email, phone, items: string[], total: number }
  public async postOrder(order: {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
    items: string[]; // Массив ID товаров
    total: number;
  }): Promise<{ id: string; total: number }> {
    const data = await this.api.post<{ id: string; total: number } | { error: string }>('/order', order);
    // Если в ответе есть ошибка (например, товар не найден, неверная сумма или отсутствие адреса), выбрасываем ошибку
    if ('error' in data) {
      throw new Error(data.error);
    }
    return data; // Возвращаем успешный результат
  }
}