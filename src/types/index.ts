export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

// Интерфейс IProduct
export interface IProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number | null;
  description: string;
}

// Интерфейс Buyer
export type TPayment = 'card' | 'cash' | '';

export interface IBuyer {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
}

// Интерфейс для объекта заказа, отправляемого на сервер
export interface IOrder {
    payment: TPayment;
    address: string;
    email: string;
    phone: string;
    items: string[]; // Массив ID товаров
    total: number;
}

// Интерфейс для ответа на GET /product/ (массив товаров с общим количеством)
export interface IProductResponse {
  total: number;
  items: IProduct[];
}

// Интерфейс для данных заказа, передаваемых на POST /order/
export interface IOrderData {
  payment: TPayment;
  address: string;
  email: string;
  phone: string;
  items: string[]; // Массив ID товаров (строки)
  total: number;
}

// Тип для ответа на POST /order/ (успешный результат)
export interface IOrderResponse {
  id: string;
  total: number;
}

// Тип для ошибок в API-ответах (общий для GET и POST)
export interface IApiError {
  error: string;
}