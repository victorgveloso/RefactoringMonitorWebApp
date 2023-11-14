import { Component } from '@angular/core';
import { BackEndService } from './backend.service';
import { Lambda } from '../model/lambda'
import { PaginatorService } from './paginator.service';

@Component({
  selector: 'emails-table-component',
  templateUrl: './emails-table.component.html',
  styles: [".actions { font-size: 1.5em } th, td { text-align: center }"],
  providers: [BackEndService, PaginatorService]
})

export class EmailsTableComponent {
  lambdasFiltered = [];

  constructor(private backendService: BackEndService, private paginator: PaginatorService) {
    this.backendService.getLambdasEmailedFor().subscribe(
      lambdas => {
        this.paginator.setObserver(sortedData => this.lambdasFiltered = sortedData);
        this.paginator.setPath('emails');
        this.paginator.setNumberOfItemsPerPage(lambdas.length);
        this.paginator.setData(lambdas);
      },
      error => console.log(<any>error));
  }

  public getPrettyStatus(status: string): string {
    return  Lambda.getPrettyStatus(status);
  }

}
