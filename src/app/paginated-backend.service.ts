import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../model/project';
import { Lambda } from '../model/lambda';
import { Commit } from '../model/commit';
import { Email } from '../model/email';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/Rx';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { expand } from 'rxjs/operator/expand';
import { map } from 'rxjs/operator/map';
import { toArray } from 'rxjs/operator/toArray';
import { User } from '../model/user';
import { Refactoring } from 'model/refactoring';
import { RefactoringParameter } from 'model/refactoring-parameter';
import { CodeRange } from '../model/code-range';
import { PaginatorService } from './paginator.service';
import { BackEndService } from './backend.service';
import { concat } from 'rxjs/operator/concat';

@Injectable()
export class PaginatedBackendService extends PaginatorService {
  private backendService: BackEndService;
  public static readonly ASC = 'asc';
  public static readonly DSC = 'dsc';
  private pageChangeObserver: any;
  private previousPage;

  constructor(protected activatedRoute: ActivatedRoute, protected router: Router, protected http: Http) {
    super(activatedRoute, router);
    this.previousPage = this.currentPage;
    this.backendService = new BackEndService(http, router);

  }

  public getPages() {
    return this.pages;
  }

  public getCurrentPage() {
    return this.currentPage;
  }

  public setData(data: any[]) {
    this.data = data;
  }

  protected route() {
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
    this.previousPage = this.currentPage;
    this.currentPage = currentPage;
    this.apply();
    this.route();
  }

  public setSortDir(sortDir) {
    this.sortDir = sortDir;
    this.route();
  }

  public setNumberOfItemsPerPage(items: number) {
    this.numberOfItemsPerPage = items;
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
  filterApplied: boolean = false;
  private applyFilters(data: any[]) {
    for (let field in this.filters) {
      let f = this.filters[field];
      if (f) {
        this.filterApplied = true;
        data = data.filter(value => value[field] == f);
      }
    }
    return data;
  }
  sortingApplied: boolean = false;
  private applySorting(data: any[]) {
    if (this.sortBy !== '') {
      let sortDirectionCoef: number = this.sortDir === PaginatorService.ASC ? 1 : -1;
      this.sortingApplied = true;
      data.sort((p1, p2) => {
        return this.getSortField(p1) > this.getSortField(p2) ? -1 * sortDirectionCoef : sortDirectionCoef;
      });
    }
    return data;
  }
  public apply() {
    if (this.cache && this.cache.length > 0) {
      this.getRefactorings(this.project).then(_ => {
        const data = this.cache.reduce((a, b) => a.concat(b), []);
        const filteredData = this.applyFilters(data);
        const sortedData = this.applySorting(filteredData);
        let numberOfPages;
        if (this.project) {
          numberOfPages = Math.ceil(this.project.getNumberOfCommits() / this.numberOfItemsPerPage);
        } else {
          numberOfPages = Math.ceil(sortedData.length / this.numberOfItemsPerPage);
        }
        this.pages = Array.from({length: numberOfPages}, (_, i) => i + 1);
      //   this.cache = sortedData.reduce((all,one,i) => {
      //     const ch = Math.floor(i/this.numberOfItemsPerPage); 
      //     all[ch] = [].concat((all[ch]||[]),one); 
      //     return all
      //  }, []);
        var startFrom = (this.currentPage - 1) * this.numberOfItemsPerPage;
        const slicedData = sortedData.slice(startFrom, startFrom + this.numberOfItemsPerPage);
        this.observer(slicedData);
      });
    }
  }

  protected getSortField(data: any): any {
    let sortByParts = this.sortBy.split(".");
    let toReturn: any = null;
    for (let i = 0; i < sortByParts.length; i++) {
      let currentField: string = sortByParts[i];
      toReturn = data[currentField];
      data = toReturn;
    }
    return toReturn;
  }

  public setObservers(observer, pageChangeObserver) {
    this.observer = observer;
    this.pageChangeObserver = pageChangeObserver;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * TODO: Make it paginated
   * @returns {Observable<Project[]>}
   */
  public getProjects(): Observable<Project[]> {
    let url = this.backendService.BACKEND_SERVER + "?projects";
    return this.http.get(url)
      .map(res => {
        let projectsReturnedArray = res.json();
        let projects: Project[] = [];
        for (let project of projectsReturnedArray) {
          projects.push(this.backendService.getProjectObjFromProjectRow(project));
        }
        return projects;
      })
      .catch(error => this.backendService.handleError(error, url));
  }
  private cache: any[][] = [];
  private project: Project = null;
  private isCacheHit(page: number): boolean {
    return this.cache[page] && this.cache[page].length > 0;
  }

  /**
   * TODO: Make it paginated
   * @returns {Observable<any>}
   */
  public async getRefactorings(project: Project): Promise<Refactoring[]> {
    this.project = project;
    if (!this.cache || this.cache.length == 0) {
      this.cache = Array(Math.ceil(project.getNumberOfCommits() / this.numberOfItemsPerPage));
    }
    if (this.isCacheHit(this.currentPage)) {
      // Cache hit
      // Return the cached data
      let res = this.cache[this.currentPage];
      console.log(res);
      return Promise.resolve(res);
    } else {
      // Cache miss
      if(this.previousPage < this.currentPage) {
        if (this.currentPage - this.previousPage > 1) {
          // Jumped more than one page
          // Fetch from first missing page
          while(this.isCacheHit(this.previousPage)){this.previousPage++;}
          while(this.previousPage < this.currentPage && !this.isCacheHit(this.previousPage)){
            let first = (this.previousPage - 1) * this.numberOfItemsPerPage;
            await this.fetchData(first, this.previousPage).toPromise();
            this.previousPage++;
          }
        }
      } else if(this.previousPage > this.currentPage) {
        if (this.previousPage - this.currentPage > 1) {
          // Jumped more than one page
          // Fetch from first missing page
          while(this.isCacheHit(this.previousPage)){this.previousPage--;}
          while(this.previousPage > this.currentPage && !this.isCacheHit(this.previousPage)){
            let first = (this.previousPage - 1) * this.numberOfItemsPerPage;
            await this.fetchData(first, this.previousPage).toPromise();
            this.previousPage--;
          }
        }
      }
      let first = (this.currentPage - 1) * this.numberOfItemsPerPage;
      let res = await this.fetchData(first, this.currentPage).toPromise();
      return res;
    }
  }
  private fetchData(offset: number, page: number): Observable<Refactoring[]> {
    const url = this.backendService.BACKEND_SERVER + "?refactorings&projectID=" + this.project.getID() + "&limit=" + this.numberOfItemsPerPage + "&offset=" + offset;
    const data = this.http.get(url)
      .map(res => {
        let returned = res.json()["refactorings"];
        let refactorings = this.backendService.getRefactoringsFromRow((_) => this.project, returned, (refactoring, row) => {refactoring.authorContacted = row["authorContacted"] == 1;});
        this.cache[page] = refactorings;
        return refactorings;
      })
      .catch(error => this.backendService.handleError(error, url));
    return data;
  }

  /**
   * TODO: Make it paginated
   * @returns {Observable<any>}
   */
  public getRefactoringsEmailedFor(): Observable<any> {
    let url = this.backendService.BACKEND_SERVER + "?emailedRefactorings" + this.backendService.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let returned = res.json();

        let allTheRefactorings = [];
        let mapExtraInfo = (refactoring, row) => {
          refactoring["responded"] = row["responded"] == "1";
          refactoring["tagged"] = row["tagged"] == "1";
        };
        let myRefactorings = this.backendService.getRefactoringsFromRow((refactoringRow) => this.backendService.getProjectObjFromProjectRow(refactoringRow["project"]), returned["ByMe"], mapExtraInfo);
        let otherRefactorings = this.backendService.getRefactoringsFromRow((refactoringRow) => this.backendService.getProjectObjFromProjectRow(refactoringRow["project"]), returned["ByOthers"], mapExtraInfo);
        myRefactorings.forEach(refactoring => {
          refactoring["by"] = "Me";
          allTheRefactorings.push(refactoring);
        });
        otherRefactorings.forEach(refactoring => {
          refactoring["by"] = "Others";
          allTheRefactorings.push(refactoring);
        });
        return allTheRefactorings;
      })
      .catch(error => this.backendService.handleError(error, url));
  }

}