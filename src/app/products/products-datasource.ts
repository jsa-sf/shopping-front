import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import {catchError, finalize, tap} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Product} from '../../models/product';
import {ProductService} from '../../_services/product.service';

/**
 * Data source for the Products view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class ProductsDataSource implements DataSource<Product> {

  private productsSubject = new BehaviorSubject<Product[]>([]);

  total = 0;

  constructor(private productService: ProductService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<Product[] | ReadonlyArray<Product>> {
    return this.productsSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.productsSubject.complete();
  }

  loadProducts(page: number, itemsPerPage: number): void {
    this.productService.getAll({page: page + 1, itemsPerPage}).pipe(
      catchError(() => of([]))
    ).subscribe(products => {
      this.total = products['hydra:totalItems'];
      return this.productsSubject.next(products['hydra:member']);
    });
  }

  delete(id: number, page: number, itemsPerPage: number): Observable<any> {
    return this.productService.delete(id).pipe(
      tap(() => this.loadProducts(page, itemsPerPage))
    );
  }

  add(page: number, itemsPerPage: number): Observable<any> {
    return this.productService.post().pipe(
      tap(() => this.loadProducts(page, itemsPerPage))
    );
  }

  edit(id: number, name: string, value: string, page: number, itemsPerPage: number): Observable<any> {
    return this.productService.patch(id, {[name]: value}).pipe(
      tap(() => this.loadProducts(page, itemsPerPage))
    );
  }
}
