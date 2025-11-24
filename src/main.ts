import './scss/styles.scss';

import { ApiService } from './components/models/apiService';
import { Catalog } from './components/models/catalog';
import { Buyer } from './components/models/buyer';
import { API_URL } from './utils/constants';
import { Api } from './components/base/api';
import { Gallery } from './components/views/gallery';
import { CardCatalog } from './components/views/card/cardCatalog';
import { CardBasket } from './components/views/card/cardBasket';
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
import { SelectedCart } from './components/models/selectedCard';

// Инициализация событий и модального окна
const events = new EventEmitter();
const modal = new Modal(ensureElement('#modal-container'), events);

// Инициализация экземпляров
const api = new Api(API_URL);
const apiService = new ApiService(api); // Теперь принимает IApi
const catalog = new Catalog(events); // Добавлен events
const basket = new SelectedCart(events);
const buyer = new Buyer(events); // Добавлен events
// Передача HTMLElement
const headerElement = ensureElement('.header');
const header = new Header(events, headerElement);
header.counter = 0; // Начальный счетчик

// Передача HTMLElement
const galleryElement = ensureElement('.gallery');
const gallery = new Gallery(galleryElement);

// Глобальные экземпляры статичных компонентов
// Статичные компоненты — это все, кроме карточек товаров для каталога (CardCatalog) и корзины (CardBasket), т.е. тех, которые создаются в большом количестве одновременно.
const basketContainer = cloneTemplate('#basket');
const basketView = new Basket(basketContainer, events); // Создание экземпляра один раз

// Флаги для отслеживания состояния модала
let isBasketOpen = false;
let currentCardPreview: CardPreview | null = null;
let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;

// Презентер: логика после загрузки товаров
function renderCatalog(products: IProduct[]): void {
    const cards: HTMLElement[] = products.map((product) => {
        const cardContainer = cloneTemplate('#card-catalog');
        const card = new CardCatalog(cardContainer, events);
        return card.render(product);
    });
    gallery.catalog = cards;
}

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
    header.counter = basket.items.length; // Обновление счетчика в обработчике события изменения модели (используем метод модели)
    basketView.render({ items: basket.items.map((item, index) => { 
        const cardContainer = cloneTemplate('#card-basket'); 
        const card = new CardBasket(cardContainer, events, {onDelete: () => events.emit('basket:remove', { id: item.id })}); 
        card.render({ ...item, index: index + 1 }); return cardContainer; }), 
        total: basket.total }); // Рендер корзины при изменении (без рендера при открытии)
    // Добавлена логика перерендеринга открытых форм при изменении данных покупателя
    if (currentOrderForm) {
        const data = buyer.getData();
        const errors = buyer.validate();
        const orderErrors = [errors.payment, errors.address].filter(Boolean).join('; ');
        const orderValid = !errors.payment && !errors.address;
        modal.contentElement = currentOrderForm.render({ payment: data.payment, address: data.address, errors: orderErrors, valid: orderValid });
    }
    if (currentContactsForm) {
        const data = buyer.getData();
        const errors = buyer.validate();
        const contactsErrors = [errors.email, errors.phone].filter(Boolean).join('; ');
        const contactsValid = !errors.email && !errors.phone;
        modal.contentElement = currentContactsForm.render({ email: data.email, phone: data.phone, errors: contactsErrors, valid: contactsValid });
    }
});

// Обработчик: изменение корзины (обновление счетчика и перерендеринг открытых модалов)
events.on('basket:changed', () => {
    header.counter = basket.items.length;
    if (isBasketOpen) {
        modal.contentElement = basketView.render({ items: basket.items.map((item, index) => { 
            const cardContainer = cloneTemplate('#card-basket'); 
            const card = new CardBasket(cardContainer, events, {onDelete: () => events.emit('basket:remove', { id: item.id })}); 
            card.render({ ...item, index: index + 1 }); 
            return cardContainer; }), total: basket.total });
    }
    if (currentCardPreview) {
        modal.contentElement = currentCardPreview.render({ ...currentCardPreview.getProduct(), inBasket: basket.hasItem(currentCardPreview.getProduct().id) });
    }
});

// Обработчик: открытие модального окна с CardPreview при выборе товара (по id)
events.on('card:select', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        const previewContainer = cloneTemplate('#card-preview');
        const cardPreview = new CardPreview(previewContainer, events, basket);
        modal.contentElement = cardPreview.render({ ...product, inBasket: basket.hasItem(id) }); // Исправлено: разметка получается из компонента через render
        currentCardPreview = cardPreview;
        modal.open();
    }
});

// Обработчик: добавление товара в корзину
events.on('basket:add', ({ id }: { id: string }) => {
    const product = catalog.getProductById(id);
    if (product) {
        basket.addItem(product);
         modal.close();
    }
});

// Обработчик: открытие корзины
events.on('basket:open', () => {
    modal.contentElement = basketView.render({ items: basket.items.map((item, index) => { 
        const cardContainer = cloneTemplate('#card-basket'); 
        const card = new CardBasket(cardContainer, events, {onDelete: () => events.emit('basket:remove', { id: item.id })}); 
        card.render({ ...item, index: index + 1 }); 
        return cardContainer; }), total: basket.total }); // Исправлено: разметка получается из компонента через render
    isBasketOpen = true;
    modal.open();
});

// Обработчик: удаление товара из корзины
events.on('basket:remove', ({ id }: { id: string }) => {
    basket.removeItem(id);
});

// Обработчик: открытие формы заказа (способ оплаты)
events.on('basket:order', () => {
    const data = buyer.getData();
    const errors = buyer.validate();
    const orderErrors = [errors.payment, errors.address].filter(Boolean).join('; ');
    const orderValid = !errors.payment && !errors.address;
    const orderContainer = cloneTemplate('#order');
    const orderForm = new OrderForm(orderContainer, events);
    modal.contentElement = orderForm.render({ payment: data.payment, address: data.address, errors: orderErrors, valid: orderValid }); // Исправлено: разметка получается из компонента через render, локальное создание
    currentOrderForm = orderForm; // Добавлено: установка флага для текущей формы
    modal.open();
});

// Обработчик: переход к форме контактов
events.on('order:submit', () => {
    const errors = buyer.validate();
    const relevantErrors = ['payment', 'address'].filter(key => errors[key as keyof IValidationError]);
    if (relevantErrors.length > 0) {
        const orderErrors = relevantErrors.map(key => errors[key as keyof IValidationError]).filter(Boolean).join('; ');
        const orderContainer = cloneTemplate('#order');
        const orderForm = new OrderForm(orderContainer, events);
        modal.contentElement = orderForm.render({ ...buyer.getData(), errors: orderErrors, valid: false }); // Рендер с ошибками для текущей формы
        return;
    }
    const data = buyer.getData();
    const contactsErrors = [errors.email, errors.phone].filter(Boolean).join('; ');
    const contactsValid = !errors.email && !errors.phone;
    const contactsContainer = cloneTemplate('#contacts');
    const contactsForm = new ContactsForm(contactsContainer, events);
    modal.contentElement = contactsForm.render({ email: data.email, phone: data.phone, errors: contactsErrors, valid: contactsValid }); // Исправлено: разметка получается из компонента через render, локальное создание
    currentContactsForm = contactsForm; // Добавлено: установка флага для текущей формы
    currentOrderForm = null; // Сброс флага предыдущей формы
    modal.open();
});

// Обработчик: отправка заказа
events.on('contacts:submit', () => {
    const errors = buyer.validate();
    const relevantErrors = ['email', 'phone'].filter(key => errors[key as keyof IValidationError]);
    if (relevantErrors.length > 0) {
        const contactsErrors = relevantErrors.map(key => errors[key as keyof IValidationError]).filter(Boolean).join('; ');
        const contactsContainer = cloneTemplate('#contacts');
        const contactsForm = new ContactsForm(contactsContainer, events);
        modal.contentElement = contactsForm.render({ ...buyer.getData(), errors: contactsErrors, valid: false }); // Рендер с ошибками для текущей формы
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
        modal.contentElement = orderSuccess.render({ total }); // Исправлено: разметка получается из компонента через render, локальное создание
        currentContactsForm = null; // Сброс флага при завершении
        modal.open();
    });
});

// Обработчик: закрытие окна успеха
events.on('success:close', () => {
    modal.close();
});

// Обработчик: товара в корзине
events.on('basket:toggle', ({ id }: { id: string }) => {
    if (basket.hasItem(id)) {
        basket.removeItem(id);
    } else {
        const product = catalog.getProductById(id);
        if (product) {
            basket.addItem(product);
            modal.close(); // Добавлено: закрытие модала после добавления товара
        }
    }
});

// Обработчики событий
events.on('modal:close', () => {
    isBasketOpen = false;
    currentCardPreview = null;
    currentOrderForm = null;
    currentContactsForm = null;
});

// Выполнение запроса на получение товаров
apiService.getProducts()
  .then(products => {
    // Сохранение массива товаров в модель Catalog
    catalog.setProducts(products);
    // Вывод сохранённого каталога в консоль для проверки
    console.log('Каталог товаров:', catalog.getProducts());
    renderCatalog(products); // Вызов рендера каталога после загрузки товаров
  })
  .catch(error => {
    console.error('Ошибка при получении товаров:', error);
  });
