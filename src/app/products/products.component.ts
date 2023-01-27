import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTable} from '@angular/material/table';
import {ProductsDataSource} from './products-datasource';
import {ProductService} from '../../_services/product.service';
import {catchError, tap} from 'rxjs/operators';
import {Product} from '../../models/product';
import {TitleService} from '../../_services/title.service';
import {TokenStorageService} from '../../_services/token-storage.service';
import {User} from '../../models/user';
import {UserService} from '../../_services/user.service';
import {EventBusService} from '../../_shared/event-bus.service';
import {EventData} from '../../_shared/event-data';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<Product>;
  dataSource: ProductsDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['name', 'quantity', 'owner', 'sharedUser', 'actions'];
  pageSize = 10;
  loadingActions = false;
  editingColumnName?: string = null;
  allUsers: User[] = [];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private titleService: TitleService,
    private tokenStorageService: TokenStorageService,
    private eventBusService: EventBusService,
  ) {
    titleService.setTitle('Liste de courses');
    this.dataSource = new ProductsDataSource(this.productService);
  }

  ngOnInit(): void {
    this.userService.getAll().pipe().subscribe((users) => {
      this.allUsers = users;
    }, (err) => {
      if (err.code === 403) {
        this.eventBusService.emit(new EventData('logout', null));
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.loadProducts(0, this.pageSize);
    this.table.dataSource = this.dataSource;
    this.paginator.page.pipe(
      tap(() => this.loadProductsPage())
    ).subscribe();
  }

  loadProductsPage(): void {
    this.dataSource.loadProducts(this.paginator.pageIndex, this.paginator.pageSize);
    this.table.dataSource = this.dataSource;
  }

  isMe(email): boolean {
    return this.tokenStorageService.getUser().email === email;
  }

  delete(id: number): void {
    this.loadingActions = true;
    this.dataSource.delete(id, this.paginator.pageIndex, this.paginator.pageSize).subscribe().add(() => {
      this.loadingActions = false;
    });
  }

  add(): void {
    this.loadingActions = true;
    this.dataSource.add(0, this.paginator.pageSize).subscribe().add(() => {
      this.loadingActions = false;
    });
  }

  activeEdit(id: number, columnName: string): void {
    this.editingColumnName = columnName + '-' + id;
  }

  save(id: number, name: string, value?: string): void {
    this.loadingActions = true;
    this.dataSource.edit(id, name, value ?? null, this.paginator.pageIndex, this.paginator.pageSize).subscribe().add(() => {
      this.editingColumnName = null;
      this.loadingActions = false;
    });
  }
}
