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

// Передача HTMLElement
const galleryElement = ensureElement('.gallery');
const gallery = new Gallery(galleryElement);

// Глобальные экземпляры статичных компонентов
// Статичные компоненты — это все, кроме карточек товаров для каталога (CardCatalog) и корзины (CardBasket), т.е. тех, которые создаются в большом количестве одновременно.
const basketContainer = cloneTemplate('#basket');
const basketView = new Basket(basketContainer, events); // Создание экземпляра один раз

const successContainer = cloneTemplate('#success');
const orderSuccess = new OrderSuccess(successContainer, events); // Создание глобального экземпляра один раз

const orderContainer = cloneTemplate('#order');
const orderForm = new OrderForm(orderContainer, events); // Создание экземпляра один раз

const contactsContainer = cloneTemplate('#contacts');
const contactsForm = new ContactsForm(contactsContainer, events); // Создание экземпляра один раз

// Флаги для отслеживания состояния модала
let isBasketOpen = false;
let currentCardPreview: CardPreview | null = null;
let currentOrderForm: OrderForm | null = null;
let currentContactsForm: ContactsForm | null = null;
let currentProduct: IProduct | null = null;

// Презентер: логика после загрузки товаров
function renderCatalog(products: IProduct[]): void {
    const cards: HTMLElement[] = products.map((product) => {
        const cardContainer = cloneTemplate('#card-catalog');
        const card = new CardCatalog(cardContainer, { onClick: () => events.emit('card:select', product) });
        card.title = product.title;
        card.price = product.price;
        card.category = product.category;
        card.image = product.image;
        return cardContainer;
    });
    gallery.catalog = cards;
}

// Обработчик: обновление каталога после сохранения товаров в модели
events.on('catalog:updated', () => {
    renderCatalog(catalog.getProducts());
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
            const card = new CardBasket(cardContainer, {onDelete: () => events.emit('basket:remove', { id: item.id })}); 
            card.title = item.title;
            card.price = item.price;
            card.index = index + 1;
            return cardContainer; }), total: basket.total });
    }
    if (currentCardPreview && currentProduct) {
        // Презентер напрямую устанавливает свойства через setters для обновления DOM без хранения данных в view
        currentCardPreview.title = currentProduct.title;
        currentCardPreview.price = currentProduct.price;
        currentCardPreview.description = currentProduct.description;
        currentCardPreview.image = currentProduct.image;
        currentCardPreview.category = currentProduct.category;
        currentCardPreview.buttonText = basket.hasItem(currentProduct.id) ? 'Удалить из корзины' : 'В корзину';
        currentCardPreview.buttonDisabled = currentProduct.price === null;
    }
});

// Обработчик: открытие модального окна с CardPreview при выборе товара (по id)
events.on('card:select', (product: IProduct) => {
        currentProduct = product;
        const previewContainer = cloneTemplate('#card-preview');
        currentCardPreview = new CardPreview(previewContainer, { onToggle: () => events.emit('basket:toggle', { id: product.id }) });
        // Презентер напрямую устанавливает свойства через setters для обновления DOM без хранения данных в view (убран вызов render)
        currentCardPreview.title = product.title;
        currentCardPreview.price = product.price;
        currentCardPreview.description = product.description;
        currentCardPreview.image = product.image;
        currentCardPreview.category = product.category;
        currentCardPreview.buttonText = basket.hasItem(product.id) ? 'Удалить из корзины' : 'В корзину';
        currentCardPreview.buttonDisabled = product.price === null;
        modal.contentElement = previewContainer; // Прямая установка контейнера, без render
        modal.open();
    // }
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
        const card = new CardBasket(cardContainer, {onDelete: () => events.emit('basket:remove', { id: item.id })}); 
        card.title = item.title;
        card.price = item.price;
        card.index = index + 1;
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
        modal.contentElement = orderForm.render({ ...buyer.getData(), errors: orderErrors, valid: false }); // Рендер с ошибками для текущей формы
        return;
    }
    const data = buyer.getData();
    const contactsErrors = [errors.email, errors.phone].filter(Boolean).join('; ');
    const contactsValid = !errors.email && !errors.phone;
    modal.contentElement = contactsForm.render({ email: data.email, phone: data.phone, errors: contactsErrors, valid: contactsValid }); // Исправлено: разметка получается из компонента через render, локальное создание
    currentContactsForm = contactsForm; // Добавлено: установка флага для текущей формы
    currentOrderForm = null; // Сброс флага предыдущей формы
    modal.open();
});

// Обработчик: отправка заказа
events.on('contacts:submit', () => {
    const orderData: IOrder = {
        ...buyer.getData(),
        items: basket.items.map(p => p.id),
        total: basket.total
    };
    apiService.postOrder(orderData).then((response) => {
        const total = response.total; // Используем total из ответа сервера для отображения
        basket.clear();
        header.counter = 0;
        modal.contentElement = orderSuccess.render({ total }); // Исправлено: разметка получается из компонента через render, локальное создание - исправлено на использование глобального
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
        }
    }
    modal.close();
});

// Выполнение запроса на получение товаров
apiService.getProducts()
  .then(products => {
    // Сохранение массива товаров в модель Catalog
    catalog.setProducts(products);
    // Вывод сохранённого каталога в консоль для проверки
    console.log('Каталог товаров:', catalog.getProducts());
  })
  .catch(error => {
    console.error('Ошибка при получении товаров:', error);
  });
