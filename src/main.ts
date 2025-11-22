import './scss/styles.scss';

import { ApiService } from './components/models/apiService';
import { Catalog } from './components/models/catalog';
import { BasketModel } from './components/models/basketModel';
import { Buyer } from './components/models/buyer';
import { API_URL } from './utils/constants';
import { Api } from './components/base/api';
import { Gallery } from './components/views/gallery';
import { CardCatalog } from './components/views/card/cardCatalog';
import { cloneTemplate } from './utils/utils';
import { IProduct, IOrder, TPayment, IValidationError } from './types';
import { EventEmitter } from './components/base/events';
import { Modal } from './components/views/modals/modal';
import { CardPreview } from './components/views/card/cardPreview';
import { Basket } from './components/views/modals/basket';
import { OrderForm } from './components/views/modals/orderForm';
import { ContactsForm } from './components/views/modals/contactsForm';
import { OrderSuccess } from './components/views/modals/orderSuccess';
import { Header } from './components/views/header';
import { ensureElement } from './utils/utils';

// Инициализация событий и модального окна
const events = new EventEmitter();
const modal = new Modal(ensureElement('#modal-container'), events);

// Инициализация экземпляров
const api = new Api(API_URL);
const apiService = new ApiService(api); // Теперь принимает IApi
const catalog = new Catalog(events); // Добавлен events
const basket = new BasketModel(events); // Добавлен events
const buyer = new Buyer(events); // Добавлен events
// Передача HTMLElement
const headerElement = ensureElement('.header');
const header = new Header(events, headerElement);
header.counter = 0; // Начальный счетчик

// Передача HTMLElement
const galleryElement = ensureElement('.gallery');
const gallery = new Gallery(galleryElement);

// Ссылки на текущие формы для обновления
let orderForm: OrderForm | null = null;
let contactsForm: ContactsForm | null = null;
let currentPreview: CardPreview | null = null; // Для обновления кнопки в открытом preview

// Функция обновления текущей открытой формы
function updateCurrentForm(): void {
  const data = buyer.getData();
  const errors = buyer.validate();
  if (orderForm?.getContainer().parentElement) {
    orderForm.render({ ...data, errors });
  }
  if (contactsForm?.getContainer().parentElement) {
    contactsForm.render({ ...data, errors });
  }
}

// Презентер: логика после загрузки товаров
function renderCatalog(products: IProduct[]): void {
    const cards: HTMLElement[] = products.map((product) => {
        const cardContainer = cloneTemplate('#card-catalog');
        const card = new CardCatalog(cardContainer, events);
        return card.render(product);
    });
    gallery.catalog = cards;
}

// Обработчики событий
events.on('modal:open', () => {
    document.body.style.overflow = 'hidden';
});

events.on('modal:close', () => {
    document.body.style.overflow = '';
    currentPreview = null; // Сброс при закрытии модала
});

// Обработчик: изменение данных покупателя (из форм)
events.on('buyer:payment', ({ payment }: { payment: TPayment }) => {
    buyer.setData({ payment });
});

events.on('buyer:address', ({ address }: { address: string }) => {
    buyer.setData({ address });
});

events.on('buyer:email', ({ email }: { email: string }) => {
    buyer.setData({ email });
});

events.on('buyer:phone', ({ phone }: { phone: string }) => {
    buyer.setData({ phone });
});

events.on('buyer:changed', () => {
    updateCurrentForm();
});

// Обработчик: открытие модального окна с CardPreview при выборе товара (по id)
events.on('card:select', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        const previewContainer = cloneTemplate('#card-preview');
        const cardPreview = new CardPreview(previewContainer, events);
        cardPreview.render(product, basket.hasItem(id)); // Передаем статус inBasket
        modal.contentElement = previewContainer;
        currentPreview = cardPreview; // Сохраняем ссылку для обновления
        modal.open();
    }
});

// Обработчик: добавление товара в корзину
events.on('basket:add', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        basket.addItem(product);
        // header.counter = basket.items.length; // Обновление счетчика (общее кол-во уникальных товаров)
        // modal.close(); // Закрытие модального окна после добавления — удалено, модал остается открытым
    }
});

// Обработчик: открытие корзины
events.on('basket:open', () => {
    // const basketContainer = cloneTemplate('#basket');
    // const basketView = new Basket(basketContainer, events);
    // basketView.render({ items: basket.items, total: basket.total });
    modal.contentElement = basketView.getContainer(); // Используем глобальный экземпляр (рендер в 'basket:changed')
    modal.open();
});

// Обработчик: удаление товара из корзины
events.on('basket:remove', ({ id }: { id: string }) => {
    basket.removeItem(id);
    // header.counter = basket.items.length; // Обновление счетчика
    // if (!(currentPreview && currentPreview.id === id)) { // Исправлено: currentPreview.id теперь публичный геттер
    //     modal.close(); // Закрываем только если удаление не из preview (т.е. из basket)
    // }
});

// Обработчик: открытие формы заказа (способ оплаты)
events.on('basket:order', () => {
    const orderContainer = cloneTemplate('#order');
    orderForm = new OrderForm(orderContainer, events);
    orderForm.render({ ...buyer.getData(), errors: buyer.validate() }); // Render с данными и ошибками через объект
    modal.contentElement = orderForm.render({ ...buyer.getData(), errors: buyer.validate() }); // Установка через render() компонента (orderContainer уже отрендерен)
    modal.open();
    contactsForm = null;
});

// Обработчик: переход к форме контактов
events.on('order:submit', () => {
    const errors = buyer.validate();
    const relevantErrors = ['payment', 'address'].filter(key => errors[key as keyof IValidationError]);
    if (relevantErrors.length > 0) {
        if (orderForm?.getContainer().parentElement) {
            orderForm.render({ ...buyer.getData(), errors });
        }
        return;
    }
    const contactsContainer = cloneTemplate('#contacts');
    contactsForm = new ContactsForm(contactsContainer, events);
    contactsForm.render({ ...buyer.getData(), errors: buyer.validate() }); // Render с данными и ошибками через объект
    modal.contentElement = contactsForm.render({ ...buyer.getData(), errors: buyer.validate() }); // Установка через render() компонента (contactsContainer уже отрендерен)
    modal.open();
    orderForm = null;
});

// Обработчик: отправка заказа
events.on('contacts:submit', () => {
    const errors = buyer.validate();
    const relevantErrors = ['email', 'phone'].filter(key => errors[key as keyof IValidationError]);
    if (relevantErrors.length > 0) {
        if (contactsForm?.getContainer().parentElement) {
            contactsForm.render({ ...buyer.getData(), errors });
        }
        return;
    }
    const orderData: IOrder = {
        ...buyer.getData(),
        items: basket.items.map(p => p.id),
        total: basket.total
    };
    apiService.postOrder(orderData).then((response) => {
        const total = response.total; // Используем total из ответа сервера для отображения
        basket.clear();
        header.counter = 0;
        const successContainer = cloneTemplate('#success');
        const orderSuccess = new OrderSuccess(successContainer, events);
        orderSuccess.render({ total }); // Передача total для отображения суммы от сервера
        modal.contentElement = successContainer; // Установка через render() компонента (successContainer уже отрендерен)
        modal.open();
        contactsForm = null;
    }).catch(error => {
        console.error('Ошибка при оформлении заказа:', error);
    });
});

// Обработчик: закрытие окна успеха
events.on('success:close', () => {
    modal.close();
});

// Обработчик изменения корзины для обновления счетчика и рендера
events.on('basket:changed', () => {
    header.counter = basket.items.length; // Обновление счетчика в обработчике события изменения модели (используем метод модели)
    basketView.render({ items: basket.items, total: basket.total }); // Рендер корзины при изменении (без рендера при открытии)
    if (currentPreview) {
        const inBasket = basket.hasItem(currentPreview.id); // Исправлено: currentPreview.id теперь публичный геттер
        currentPreview.updateButton(inBasket); // Обновление кнопки в открытом preview (возврат в "В корзину" после remove)
    }
});

// Глобальные экземпляры статичных компонентов
const basketContainer = cloneTemplate('#basket');
const basketView = new Basket(basketContainer, events); // Создание экземпляра один раз
basketView.render({ items: basket.items, total: basket.total }); // Начальный рендер (пустая корзина)

// Выполнение запроса на получение товаров
apiService.getProducts()
  .then(products => {
    // Сохранение массива товаров в модель Catalog
    catalog.setProducts(products);
    // Вывод сохранённого каталога в консоль для проверки
    console.log('Каталог товаров:', catalog.getProducts());
    // renderCatalog(products);
  })
  .catch(error => {
    console.error('Ошибка при получении товаров:', error);
  });

// Обработчик изменения каталога
events.on('catalog:updated', (products: IProduct[]) => {
    renderCatalog(products); // Рендер каталога после события от модели
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