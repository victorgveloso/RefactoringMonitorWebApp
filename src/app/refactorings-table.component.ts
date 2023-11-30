import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange } from '@angular/core';
import { Refactoring } from '../model/refactoring';
import { Project } from '../model/project';
import { PaginatorService } from './paginator.service';
import { BackEndService } from './backend.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';

@Component({
  selector: 'refactorings-table-component',
  templateUrl: './refactorings-table.component.html',
  styleUrls: ['./refactorings-table.component.css'],
  providers: [PaginatorService]
})
export class RefactoringsTableComponent implements OnChanges {
  @Input() project: Project;
  private sub: any;
  private refactoringsFetched: boolean = false;
  private refactoringsFiltered: Refactoring[];
  private refactoringsSubscription: Observable<Refactoring[]>;

  constructor(private paginator: PaginatorService, private backendService: BackEndService, private router: Router) {
    this.refactoringsFiltered = [];
  }

  public getPrettyStatus(status: string) : string {
   return Refactoring.getPrettyStatus(status);
  }

  public skipRefactoring(refactoring: Refactoring, skip: boolean) {
    this.backendService.skipRefactoring(refactoring, skip)
      .subscribe(
        status => {},
        error => console.log(error)
      );
  }

  private changeShowOnlyNewRefactorings(shouldShowOnlyNew: boolean) {
    if (shouldShowOnlyNew) {
      this.paginator.addFilter("status", "NEW");
    } else {
      this.paginator.removeFilter("status");
    }
  }

  private navigateTo(refactoring: Refactoring) {
    let projectID = this.project.getID();
    let refactoringID = refactoring.getID();
    if (!projectID || !refactoringID) {
      console.error(projectID, refactoringID);
      console.error(refactoring);
      
      return;
    }
    this.router.navigate(['/refactoring-details', projectID, refactoringID]);
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      if (propName == "project") {
        let changedProp = changes[propName];
        this.project = changedProp.currentValue;
        if (this.project) {
          this.refactoringsSubscription = this.backendService.getRefactorings(this.project);
          this.sub = this.refactoringsSubscription
            .subscribe(refactorings => {
              this.paginator.setObserver(sortedData => {
                if (sortedData && sortedData.length > 0) {
                  this.refactoringsFiltered = sortedData;
                }
              });
              this.paginator.setPath('project-details/' + this.project.getID());
              this.paginator.setData(refactorings);
              this.paginator.apply();
            }, 
            error => console.log(<any>error),
            () => {
              this.refactoringsFetched = true;
            });
        }
      }
    }
  }

  ngOnDesctroy() {
    console.log('refactoringsFiltered:', this.refactoringsFiltered);
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }


}