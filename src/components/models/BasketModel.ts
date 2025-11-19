import { IBasket, IProduct } from '../../types';

export class BasketModel implements IBasket {
    private _items: IProduct[] = [];

    get items(): IProduct[] {
        return this._items;
    }

    get total(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    addItem(product: IProduct): void {
        if (product.price !== null && !this.hasItem(product.id)) {
            this._items.push(product);
        }
    }

    removeItem(id: string): void {
        this._items = this._items.filter(item => item.id !== id);
    }

    hasItem(id: string): boolean {
        return this._items.some(item => item.id === id);
    }

    clear(): void {
        this._items = [];
    }
}
