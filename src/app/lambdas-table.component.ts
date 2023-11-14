import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange } from '@angular/core';
import { Lambda } from '../model/lambda';
import { Project } from '../model/project';
import { PaginatorService } from './paginator.service';
import { BackEndService } from './backend.service';

@Component({
  selector: 'lambdas-table-component',
  templateUrl: './lambdas-table.component.html',
  styleUrls: ['./lambdas-table.component.css'],
  providers: [PaginatorService]
})
export class LambdasTableComponent implements OnChanges {
  @Input() project: Project;
  private sub: any;
  private lambdasFiltered: Lambda[];

  constructor(private paginator: PaginatorService, private backendService: BackEndService) {
  }

  public getPrettyStatus(status: string) : string {
   return Lambda.getPrettyStatus(status);
  }

  public skipLambda(lambda: Lambda, skip: boolean) {
    this.backendService.skipLambda(lambda, skip)
      .subscribe(
        status => {},
        error => console.log(error)
      );
  }

  private changeShowOnlyNewLambdas(shouldShowOnlyNew: boolean) {
    if (shouldShowOnlyNew) {
      this.paginator.addFilter("status", "NEW");
    } else {
      this.paginator.removeFilter("status");
    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      if (propName == "project") {
        let changedProp = changes[propName];
        this.project == changedProp.currentValue;
        if (this.project) {
          this.sub = this.backendService.getLambdas(this.project)
            .subscribe(lambdas => {
              this.paginator.setObserver(sortedData => this.lambdasFiltered = sortedData);
              this.paginator.setPath('project-details/' + this.project.getID());
              this.paginator.setData(lambdas);
              this.paginator.apply();
            }, error => console.log(<any>error));
        }
      }
    }
  }

  ngOnDesctroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

}