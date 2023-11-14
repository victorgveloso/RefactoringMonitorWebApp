import { Component, Input } from '@angular/core';
import { PaginatorService } from './paginator.service';

@Component({
  selector: '[paginator]',
  templateUrl: './paginator.component.html'
})
export class PaginatorComponent {
  @Input() paginator: PaginatorService;
  @Input() colspan: number;
}
