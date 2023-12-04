import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'basename'
})
export class BasenamePipe implements PipeTransform {

  transform(value: string): string {
    let basename = value.split('/').pop();
    if (basename) {
      return basename;
    }
    return "";
  }

}