import { Injectable } from '@angular/core';
import {HttpClient, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from '../models/product';

export interface ProductsParams {
  page: number;
  itemsPerPage: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private http: HttpClient) { }

  getAll(params: ProductsParams): Observable<Product[]> {
    return this.http.get<Product[]>('/api/products', {params: params as any});
  }

  post(): Observable<Product> {
    return this.http.post<Product>('/api/products', {
      name: '<nouveau produit>',
      quantity: 1
    });
  }

  delete(id: number): Observable<any> {
    return this.http.delete('/api/products/' + id);
  }

  patch(id: number, values: any): Observable<any> {
    return this.http.patch('/api/products/' + id, values, {
      headers: {
        ['content-type']: 'application/merge-patch+json'
      }
    });
  }
}
