import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackEndService } from './backend.service';
import { Project } from '../model/project';

@Component({
  selector: 'project-details-component',
  templateUrl: './project-details.component.html',
  providers: [BackEndService],
})
export class ProjectDetailsComponent {

  private sub: any;
  private project: Project;
  
  constructor(private backEndService: BackEndService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let projectID = +params['id'];
      this.backEndService.getProject(projectID).subscribe(
          project => {
            this.project = project;
          },
        error => console.log(<any>error));
    });
  }

   ngOnDestroy() {
    this.sub.unsubscribe();
  }

}