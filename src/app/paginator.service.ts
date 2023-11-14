import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class PaginatorService {

  public static readonly ASC = 'asc';
  public static readonly DSC = 'dsc';

  private numberOfItemsPerPage: number;
  private currentPage: number = 1;
  private sortBy: string = '';
  private sortDir: string = PaginatorService.ASC;
  private pages: number[];
  private data: any[];
  private observer: any;
  private sub: any;
  private path: string;
  private filters: Object;

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {

    this.sub = this.activatedRoute.queryParams.subscribe(params => {
      this.sortBy = (params['sort'] || '');
      this.currentPage = (+params['page'] || 1);
      this.numberOfItemsPerPage = (+params['items'] || 100);
      this.sortDir = (params['sortDir'] || PaginatorService.ASC);
      this.filters = Object();
      if (params['filters']) {
        let filters = params['filters'];
        let allFiltersStrings = filters.split(",");
        for (let filterString of allFiltersStrings) {
          if ("" != filterString.trim()) {
            let filterStringSplitted = filterString.split(":");
            let filterField = filterStringSplitted[0];
            let filterValue = filterStringSplitted[1];
            this.filters[filterField] = filterValue;
          }
        }
      }
      this.apply();
    });

  }

  public getPages() {
    return this.pages;
  }

  public getCurrentPage() {
    return this.currentPage;
  }

  public setData(data: any[]) {
    this.data = data;
    this.apply();
  }

  public setPath(path) {
    this.path = path;
  }

  private route() {
    this.router.navigate([this.path], { queryParams: this.getParams() });
  }

  public setSortBy(sortBy) {
    let sortDir = this.sortDir;
    if (sortBy === this.sortBy) {
      if (sortDir === PaginatorService.ASC) {
        sortDir = PaginatorService.DSC;
      } else {
        sortDir = PaginatorService.ASC;
      }
    }
    this.sortBy = sortBy;
    this.sortDir = sortDir;
    this.route();
  }

  public setCurrentPage(currentPage) {
    this.currentPage = currentPage;
    this.route();
  }

  public setSortDir(sortDir) {
    this.sortDir = sortDir;
    this.route();
  }

  public setNumberOfItemsPerPage(items: number) {
    this.numberOfItemsPerPage = items;
  }

  public addFilter(field: string, value: string) {
    this.filters[field] = value;
    this.route();
  }

  public removeFilter(field) {
    this.filters[field] = null;
    this.route();
  }

  public getParams() {
    let f: string = "";
    for (let filter in this.filters) {
      if (this.filters[filter]) {
        f += filter + ":" + this.filters[filter] + ",";
      }
    }
    return {
      sort: this.sortBy,
      page: this.currentPage,
      sortDir: this.sortDir,
      items: this.numberOfItemsPerPage,
      filters: f
    };
  }

  public apply() {
    if (this.data) {
      let filteredData = this.data.slice(0);
      for (let field in this.filters) {
        let f = this.filters[field];
        if (f) {
          filteredData = filteredData.filter(value => value[field] == f);
        }
      }
      if (this.sortBy !== '') {
        let sortDirectionCoef: number = this.sortDir === PaginatorService.ASC ? 1 : -1;
        filteredData.sort((p1, p2) => {
          return this.getSortField(p1) > this.getSortField(p2) ? -1 * sortDirectionCoef : sortDirectionCoef;
        });
      }
      let numberOfPages = Math.floor(filteredData.length / this.numberOfItemsPerPage);
      if (filteredData.length % this.numberOfItemsPerPage != 0) {
        numberOfPages++;
      }
      this.pages = [];
      for (let i = 1; i <= numberOfPages; i++) {
        this.pages.push(i);
      }
      var startFrom = (this.currentPage - 1) * this.numberOfItemsPerPage;
      filteredData = filteredData.slice(startFrom, startFrom + this.numberOfItemsPerPage);
      this.observer(filteredData);
    }
  }

  private getSortField(data: any): any {
    let sortByParts = this.sortBy.split(".");
    let toReturn: any = null;
    for (let i = 0; i < sortByParts.length; i++) {
      let currentField: string = sortByParts[i];
      toReturn = data[currentField];
      data = toReturn;
    }
    return toReturn;
  }

  public setObserver(observer) {
    this.observer = observer;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}