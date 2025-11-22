import { IBasket, IProduct } from '../../types';
import { IEvents } from '../base/events'; // Добавлен импорт

export class BasketModel implements IBasket {
    private _items: IProduct[] = [];

    constructor(private events: IEvents) {} // Добавлен конструктор с events

    get items(): IProduct[] {
        return this._items;
    }

    get total(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    addItem(product: IProduct): void {
        if (product.price !== null && !this.hasItem(product.id)) {
            this._items.push(product);
            this.events.emit('basket:changed', { items: this._items, total: this.total }); // Добавлен эмит
        }
    }

    removeItem(id: string): void {
        this._items = this._items.filter(item => item.id !== id);
        this.events.emit('basket:changed', { items: this._items, total: this.total }); // Добавлен эмит
    }

    hasItem(id: string): boolean {
        return this._items.some(item => item.id === id);
    }

    clear(): void {
        this._items = [];
        this.events.emit('basket:changed', { items: this._items, total: this.total }); // Добавлен эмит
    }
}