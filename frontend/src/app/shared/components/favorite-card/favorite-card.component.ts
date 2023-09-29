import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from "../../../../environments/environment.development";
import {FavoriteType} from "../../../../types/favorite.type";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CartService} from "../../services/cart.service";
import {FavoriteService} from "../../services/favorite.service";
import {Subject} from "rxjs";

@Component({
  selector: 'favorite-card',
  templateUrl: './favorite-card.component.html',
  styleUrls: ['./favorite-card.component.scss']
})
export class FavoriteCardComponent implements OnInit{
  countInCart: number | undefined = 0;
  serverStaticPath: string= environment.serverStaticPath;
  count: number = 1;
  cart: CartType | null = null;
  products: FavoriteType[] = [];
  observer = new Subject();

  @Input() product!: FavoriteType;
  constructor(private cartService: CartService,
              private favoriteService: FavoriteService) {
  }

  ngOnInit() {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error = (data as DefaultResponseType).message;
          throw new Error(error);
        }

        this.products = data as FavoriteType[];
      });

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.cart = data as CartType;

        if (this.cart && this.cart.items.length > 0) {
          const productInCart = this.cart.items.find(item => item.product.id === this.product.id);

          if (productInCart) {
            this.product.countInCart = productInCart.quantity;
            this.count = productInCart.quantity;
          }
        }
      });
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.product.countInCart = this.count;
      });
  }

  removeFromFavorites() {
    this.favoriteService.removeFavorite(this.product.id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }

        this.products = this.products.filter(item => item.id !== this.product.id);
        this.favoriteService.products$.next(this.products)
      })
  }

  updateCount(value: number) {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.product.countInCart = this.count;
        });
    }
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.product.countInCart = 0;
        this.count = 1;
      });
  }
}
