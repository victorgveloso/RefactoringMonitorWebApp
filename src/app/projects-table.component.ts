import { Component } from '@angular/core';
import { BackEndService } from './backend.service';
import { Project } from '../model/project'
import { PaginatorService } from './paginator.service';

@Component({
  selector: 'projects-table-component',
  templateUrl: './projects-table.component.html',
  styles: ['td, th { text-align: center }'],
  providers: [BackEndService, PaginatorService]
})
export class ProjectsTableComponent {
  projectsFiltered: Project[];

  constructor(private backEndService: BackEndService, private paginator: PaginatorService) {
    this.backEndService.getProjects().subscribe(
      projects => {
        this.paginator.setObserver(sortedData => this.projectsFiltered = sortedData);
        this.paginator.setPath('home');
        this.paginator.setData(projects);
        this.paginator.apply();
      },
      error => console.log(<any>error));
  }
  
  public setSort(sortBy: string) {
    this.paginator.setSortBy(sortBy);
  }

  private changeMonitor(projectID: number, event: any) {
    this.backEndService.setProjectMonitoring(projectID, event.target.checked)
      .subscribe(res => { });
  }

}