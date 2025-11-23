// import { CardCatalog } from "../components/views/Card/CardCatalog";
// import { cloneTemplate } from "../utils/utils";

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

// Тип для валидации ошибки
export interface IValidationError {
  [key: string]: string;
}

export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export interface IBasket {
	items: IProduct[];
	total: number;
	addItem(product: IProduct): void;
	removeItem(id: string): void;
	hasItem(id: string): boolean;
	clear(): void;
}

export interface IBasketItem {
    product: IProduct;
    count: number;
}

// Интерфейсы для форм (данные для представлений)
export interface IOrderFormData {
    payment: TPayment;
    address: string;
}

export interface IContactsFormData {
    email: string;
    phone: string;
}

// интерфейс IProductResponse
export interface IProductResponse {
    items: IProduct[];
    total?: number;
}

// Интерфейс для данных корзины (для рендера в Basket)
export interface IBasketData {
    items: IProduct[];
    total: number;
}

// Типы данных для форм (используются в render методах)
export interface OrderFormData {
    payment?: TPayment;
    address?: string;
    errors?: string;
    valid: boolean;
}

export interface ContactsFormData {
    email?: string;
    phone?: string;
    errors?: string;
    valid: boolean;
}

// events.on('catalog:chanhged', () => {
//   const itemCard = productsModel.getItems().map((item) => {
//     const card = new CardCatalog(cloneTemplate(CardCatalogTemplate),{
//       onClick: () => EventSource.emit('card:select', item),
//     });
//     return card.render(item);    
//   });
//   gallery.render({catalog: itemsCard});
// });

//   lekerApi
//   .getProductList()
//   .then((data) => {
//     productsModel.setItems(data.items);
//   })
//   .catch((err) => console.error(err));