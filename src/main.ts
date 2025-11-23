import './scss/styles.scss';

import { ApiService } from './components/models/apiService';
import { Catalog } from './components/models/catalog';
// import { BasketModel } from './components/models/basketModel';
import { Buyer } from './components/models/buyer';
import { API_URL } from './utils/constants';
import { Api } from './components/base/api';
import { Gallery } from './components/views/gallery';
import { CardCatalog } from './components/views/card/cardCatalog';
import { CardBasket } from './components/views/card/cardBasket'; // Добавлен импорт CardBasket
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

// Ссылки на текущие формы для обновления
let orderForm: OrderForm | null = null;
let contactsForm: ContactsForm | null = null;
let currentPreview: CardPreview | null = null; // Для обновления кнопки в открытом preview
let currentPreviewId: string | null = null; // Для хранения id текущего preview без прямого доступа к полю

// Функция обновления текущей открытой формы
function updateCurrentForm(): void {
  const data = buyer.getData();
  const errors = buyer.validate();
  if (orderForm) {
    orderForm.render({ ...data, errors });
  }
  if (contactsForm) {
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
    currentPreviewId = null; // Сброс id
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
        cardPreview.render({ ...product, inBasket: basket.hasItem(id) }); // Передаем статус inBasket в объекте
        modal.contentElement = previewContainer;
        currentPreview = cardPreview; // Сохраняем ссылку для обновления
        currentPreviewId = id; // Сохраняем id для доступа без геттера
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
    modal.contentElement = basketContainer; // Используем глобальный экземпляр (рендер в 'basket:changed')
    modal.open();
});

// Обработчик: удаление товара из корзины
events.on('basket:remove', ({ id }: { id: string }) => {
    basket.removeItem(id);
    // header.counter = basket.items.length; // Обновление счетчика
    // if (!(currentPreview && currentPreview.id === id)) { // Исправлено: проверка через currentPreviewId
    //     modal.close();
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
        if (orderForm) {
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
        if (contactsForm) {
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

// Обработчик: toggle товара в корзине (новый для упрощения логики в представлении)
events.on('basket:toggle', ({ id }: { id: string }) => {
    if (basket.hasItem(id)) {
        basket.removeItem(id);
    } else {
        const product = catalog.getProductById(id);
        if (product) {
            basket.addItem(product);
        }
    }
});

// Обработчик изменения корзины для обновления счетчика и рендера
events.on('basket:changed', () => {
    header.counter = basket.items.length; // Обновление счетчика в обработчике события изменения модели (используем метод модели)
    basketView.render({ items: basket.items.map((item, index) => { const cardContainer = cloneTemplate('#card-basket'); const card = new CardBasket(cardContainer, events); card.render({ ...item, index: index + 1 }); return cardContainer; }), total: basket.total }); // Рендер корзины при изменении (без рендера при открытии)
    if (currentPreview && currentPreviewId) {
        const product = catalog.getProductById(currentPreviewId);
        if (product) {
            currentPreview.render({ ...product, inBasket: basket.hasItem(currentPreviewId) }); // Re-render preview с обновленным inBasket
        }
    }
});

// Глобальные экземпляры статичных компонентов
const basketContainer = cloneTemplate('#basket');
const basketView = new Basket(basketContainer, events); // Создание экземпляра один раз
basketView.render({ items: basket.items.map((item, index) => { const cardContainer = cloneTemplate('#card-basket'); const card = new CardBasket(cardContainer, events); card.render({ ...item, index: index + 1 }); return cardContainer; }), total: basket.total }); // Начальный рендер (пустая корзина)

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
