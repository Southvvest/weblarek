import './scss/styles.scss';

import { ApiService } from './components/models/apiService';
import { Catalog } from './components/models/catalog';
import { BasketModel } from './components/models/BasketModel';
import { Buyer } from './components/models/buyer';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { Gallery } from './components/views/Galery';
import { CardCatalog } from './components/views/Card/CardCatalog';
import { cloneTemplate } from './utils/utils';
import { IProduct, IOrder, IBuyer } from './types';
import { EventEmitter } from './components/base/Events';
import { Modal } from './components/views/Modals/Modal';
import { CardPreview } from './components/views/Card/CardPreview';
import { Basket } from './components/views/Modals/Basket';
import { OrderForm } from './components/views/Modals/OrderForm';
import { ContactsForm } from './components/views/Modals/ContactsForm';
import { OrderSuccess } from './components/views/Modals/OurderSuccess';
import { Header } from './components/views/Header';

// Инициализация событий и модального окна
const events = new EventEmitter();
const modal = new Modal('#modal-container');

// Инициализация экземпляров
const api = new Api(API_URL);
const apiService = new ApiService(api); // Теперь принимает IApi
const catalog = new Catalog(events); // Добавлен events
const basket = new BasketModel(events); // Добавлен events
const buyer = new Buyer(events); // Добавлен events
const header = new Header(events, '.header');
header.counter = 0; // Начальный счетчик

// Получаем элемент галереи из DOM (селектор передаётся в конструктор)
const gallery = new Gallery('.gallery');

// Презентер: логика после загрузки товаров
function renderCatalog(products: IProduct[]): void {
    const cards: HTMLElement[] = products.map((product) => {
        const cardContainer = cloneTemplate('#card-catalog');
        const card = new CardCatalog(cardContainer, events);
        return card.render(product);
    });
    gallery.catalog = cards;
}

// Обработчик: открытие модального окна с CardPreview при выборе товара (по id)
events.on('card:select', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        const previewContainer = cloneTemplate('#card-preview');
        const cardPreview = new CardPreview(previewContainer, events);
        cardPreview.render(product, basket.hasItem(id)); // Передаем статус inBasket
        modal.contentElement = previewContainer;
        modal.open();
    }
});

// Обработчик: добавление товара в корзину
events.on('basket:add', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        basket.addItem(product);
        header.counter = basket.items.length; // Обновление счетчика (общее кол-во уникальных товаров)
        modal.close(); // Закрытие модального окна после добавления
    }
});

// Обработчик: открытие корзины
events.on('basket:open', () => {
    const basketContainer = cloneTemplate('#basket');
    const basketView = new Basket(basketContainer, events);
    basketView.render({ items: basket.items, total: basket.total });
    modal.contentElement = basketContainer;
    modal.open();
});

// Обработчик: удаление товара из корзины
events.on('basket:remove', ({ id }: { id: string }) => {
    basket.removeItem(id);
    header.counter = basket.items.length; // Обновление счетчика
    modal.close(); // Закрытие модального окна после удаления
});

// Обработчик: открытие формы заказа (способ оплаты)
events.on('basket:order', () => {
    const orderContainer = cloneTemplate('#order');
    const orderForm = new OrderForm(orderContainer, events);
    orderForm.render(buyer.getData());
    modal.contentElement = orderContainer;
    modal.open();
});

// Обработчик: переход к форме контактов
events.on('order:submit', (data: Partial<IBuyer>) => {
    buyer.setData(data);
    const contactsContainer = cloneTemplate('#contacts');
    const contactsForm = new ContactsForm(contactsContainer, events);
    contactsForm.render(buyer.getData());
    modal.contentElement = contactsContainer;
    modal.open();
});

// Обработчик: отправка заказа
events.on('contacts:submit', (data: Partial<IBuyer>) => {
    buyer.setData(data);
    const orderData: IOrder = {
        ...buyer.getData(),
        items: basket.items.map(p => p.id),
        total: basket.total
    };
    apiService.postOrder(orderData).then(() => {
        const total = basket.total; // Сохраняем total перед очисткой
        basket.clear();
        header.counter = 0;
        const successContainer = cloneTemplate('#success');
        const orderSuccess = new OrderSuccess(successContainer, events);
        orderSuccess.render({ total }); // Передаём total для отображения
        modal.contentElement = successContainer;
        modal.open();
    }).catch(error => {
        console.error('Ошибка при оформлении заказа:', error);
    });
});

// Обработчик: закрытие окна успеха
events.on('success:close', () => {
    modal.close();
});

// Выполнение запроса на получение товаров
apiService.getProducts()
  .then(products => {
    // Сохранение массива товаров в модель Catalog
    catalog.setProducts(products);
    // Вывод сохранённого каталога в консоль для проверки
    console.log('Каталог товаров:', catalog.getProducts());
    // Презентер: рендерим каталог после загрузки
    renderCatalog(products);
  })
  .catch(error => {
    console.error('Ошибка при получении товаров:', error);
  });





// // Импортируем классы
// import { Catalog } from './components/base/models/catalog';
// import { Buyer } from './components/base/models/buyer';
// import { SelectedCart } from './components/base/models/selectedCart';

// // Импортируем тестовые данные
// import { apiProducts } from './utils/data';

// console.log('=== Начало тестирования моделей данных ===');

// // Создание экземпляров классов
// const catalog = new Catalog();
// const buyer = new Buyer();
// const selectedCart = new SelectedCart();

// // Тестирование Catalog
// console.log('\n--- Тестирование Catalog ---');

// // Установка товаров
// catalog.setProducts(apiProducts.items);
// console.log('Установлены товары в каталог:', catalog.getProducts());

// // Получение товаров
// console.log('Получение всех товаров из каталога:', catalog.getProducts());

// // Поиск товара по ID (возьмем первый товар из массива, если он есть)
// if (apiProducts.items.length > 0) {
//   const firstProduct = apiProducts.items[0];
//   console.log(`Поиск товара по ID "${firstProduct.id}":`, catalog.getProductById(firstProduct.id));
  
//   // Установка выбранного товара
//   catalog.setSelectedProduct(firstProduct);
//   console.log('Установлен выбранный товар:', catalog.getSelectedProduct());
// }

// // Тестирование Buyer
// console.log('\n--- Тестирование Buyer ---');

// // Установка данных
// buyer.setData({
//   payment: 'card',
//   address: 'ул. Ленина, 10',
//   email: 'test@example.com',
//   phone: '+7 123 456 78 90'
// });
// console.log('Установлены данные покупателя:', buyer.getData());

// // Валидация данных
// const validationErrors = buyer.validate();
// console.log('Ошибки валидации:', validationErrors);

// // Очистка данных
// buyer.clearData();
// console.log('После очистки данных:', buyer.getData());

// // Повторная валидация после очистки
// const validationErrorsAfterClear = buyer.validate();
// console.log('Ошибки валидации после очистки:', validationErrorsAfterClear);

// // Тестирование SelectedCart
// console.log('\n--- Тестирование SelectedCart ---');

// // Добавление товаров в корзину (возьмем первые два товара, если они есть)
// if (apiProducts.items.length > 0) {
//   const product1 = apiProducts.items[0];
//   const product2 = apiProducts.items.length > 1 ? apiProducts.items[1] : product1;
  
//   selectedCart.addItem(product1);
//   console.log('Добавлен товар в корзину:', selectedCart.getItems());
  
//   selectedCart.addItem(product2);
//   console.log('Добавлен второй товар в корзину:', selectedCart.getItems());
  
//   // Проверка количества и стоимости
//   console.log('Количество товаров в корзине:', selectedCart.getItemCount());
//   console.log('Общая стоимость корзины:', selectedCart.getTotalPrice());
  
//   // Проверка наличия товара
//   console.log(`Есть ли товар с ID "${product1.id}" в корзине:`, selectedCart.hasItem(product1.id));
  
//   // Удаление товара
//   selectedCart.removeItem(product1);
//   console.log('После удаления товара:', selectedCart.getItems());
//   console.log('Количество товаров после удаления:', selectedCart.getItemCount());
//   console.log('Общая стоимость после удаления:', selectedCart.getTotalPrice());
  
//   // Очистка корзины
//   selectedCart.clear();
//   console.log('После очистки корзины:', selectedCart.getItems());
// }

// console.log('\n=== Конец тестирования моделей данных ===');