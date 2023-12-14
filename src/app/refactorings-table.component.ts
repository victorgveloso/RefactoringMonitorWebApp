import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChange } from '@angular/core';
import { Refactoring } from '../model/refactoring';
import { Project } from '../model/project';
import { PaginatorService } from './paginator.service';
import { BackEndService } from './backend.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { PaginatedBackendService } from './paginated-backend.service';

@Component({
  selector: 'refactorings-table-component',
  templateUrl: './refactorings-table.component.html',
  styleUrls: ['./refactorings-table.component.css'],
  providers: [PaginatorService]
})
export class RefactoringsTableComponent {
  @Input() project: Project;
  private sub: any;
  private refactoringsFetched: boolean = false;
  private refactoringsFiltered: Refactoring[];

  constructor(private paginator: PaginatedBackendService, private backendService: BackEndService, private router: Router) {
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

  private changeShowOnlyTestRefactorings(shouldShowOnlyTest: boolean) {
    if (shouldShowOnlyTest) {
      this.paginator.addFilter("isTestRefactoring", "1");
    } else {
      this.paginator.removeFilter("isTestRefactoring");
    }
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

  ngOnInit() {
    if (this.project) {
      this.paginator.getRefactorings(this.project);
      this.paginator.setObservers(sortedData => {
        if (sortedData && sortedData.length > 0) {
          this.refactoringsFiltered = sortedData;
          this.refactoringsFetched = true;
        }
      }, () => {
        this.refactoringsFetched = false;
      });
      this.paginator.setPath('project-details/' + this.project.getID());
      this.paginator.apply();
    }
  }

  ngOnDesctroy() {
    console.log('refactoringsFiltered:', this.refactoringsFiltered);
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }


}