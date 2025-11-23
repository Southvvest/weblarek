import { IApi } from '../../types';
// import { API_URL } from '../../utils/constants'; // Импорт константы API_URL
import { IProduct, IProductResponse, IOrder, IOrderResponse, IApiError  } from '../../types';

export class ApiService {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    // Метод для получения списка всех товаров
    public async getProducts(): Promise<IProduct[]> {
        const data = await this.api.get<IProductResponse>('/product/');
        return data.items;
    }

    // Метод для получения товара по ID
  // Делает GET-запрос на /product/{id} и возвращает товар или null
  public async getProduct(id: string): Promise<IProduct | null> {
    try {
      const data = await this.api.get<IProduct | IApiError>(`/product/${id}`);
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
    public async postOrder(order: IOrder): Promise<IOrderResponse> {
        const data = await this.api.post<IOrderResponse | IApiError>('/order', order);
        if ('error' in data) {
            throw new Error(data.error);
        }
        return data;
    }
}
