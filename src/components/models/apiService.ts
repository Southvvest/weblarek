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

    // Метод для отправки заказа
    public async postOrder(order: IOrder): Promise<IOrderResponse> {
        const data = await this.api.post<IOrderResponse | IApiError>('/order', order);
        if ('error' in data) {
            throw new Error(data.error);
        }
        return data;
    }
}

 
 
//   public async postOrder(order: {
//     payment: TPayment;
//     address: string;
//     email: string;
//     phone: string;
//     items: string[]; // Массив ID товаров
//     total: number;
//   }): Promise<{ id: string; total: number }> {
//     const data = await this.api.post<{ id: string; total: number } | { error: string }>('/order', order);
//     // Если в ответе есть ошибка (например, товар не найден, неверная сумма или отсутствие адреса), выбрасываем ошибку
//     if ('error' in data) {
//       throw new Error(data.error);
//     }
//     return data; // Возвращаем успешный результат
//   }
// }