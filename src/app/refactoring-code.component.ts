import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { Refactoring } from '../model/refactoring';

@Component({
  selector: 'refactoring-code',
  templateUrl: './refactoring-code.component.html',
  styles: ["code { padding: 3px 0; }", ".refactoring { background-color: #ffeded }"]
})
export class RefactoringCodeComponent {

  @Input() refactoring: Refactoring;
  private refactoringStringBefore : string;
  private refactoringStringAfter : string;
  private refactoringString : string;
  
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      if (propName == "refactoring") {
        let changedProp = changes[propName];
        this.refactoring == changedProp.currentValue;
        if (this.refactoring) {
            this.refactoringStringBefore = this.getRefactoringStringBefore();
            this.refactoringStringAfter = this.getRefactoringStringAfter();
            this.refactoringString = this.getRefactoringString();
        }
      }
    }
  }

  private getRefactoringStringBefore() : string {
    if (this.refactoring.getParent() && this.refactoring.getRefactoringString()) {
      return this.refactoring.getParent().substr(0, this.refactoring.getParent().indexOf(this.refactoring.getRefactoringString()));
    } 
    return "";
  }

  private getRefactoringStringAfter() : string {
    if (this.refactoring.getParent() && this.refactoring.getRefactoringString()) {
     return this.refactoring.getParent().substr(this.refactoring.getParent().indexOf(this.refactoring.getRefactoringString()) + this.refactoring.getRefactoringString().length);
    } 
    return "";
  }

  private getRefactoringString() : string {
    if (this.refactoring.getRefactoringString()) {
      return this.refactoring.getRefactoringString();
    } else {
      return this.refactoring.toString();
    }
  }

}