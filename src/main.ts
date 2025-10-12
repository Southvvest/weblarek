import './scss/styles.scss';

// main.ts

import { ApiService } from './components/base/models/apiService';
import { Catalog } from './components/base/models/catalog';

// Инициализация экземпляров
const apiService = new ApiService(); // Класс для запросов к API
const catalog = new Catalog(); // Модель для хранения каталога товаров

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