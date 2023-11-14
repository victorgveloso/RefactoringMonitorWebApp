import { Component, Input, OnChanges, SimpleChange } from '@angular/core';
import { Lambda } from '../model/lambda';

@Component({
  selector: 'lambda-code',
  templateUrl: './lambda-code.component.html',
  styles: ["code { padding: 3px 0; }", ".lambda { background-color: #ffeded }"]
})
export class LambdaCodeComponent {

  @Input() lambda: Lambda;
  private lambdaStringBefore : string;
  private lambdaStringAfter : string;
  private lambdaString : string;
  
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    for (let propName in changes) {
      if (propName == "lambda") {
        let changedProp = changes[propName];
        this.lambda == changedProp.currentValue;
        if (this.lambda) {
            this.lambdaStringBefore = this.getLambdaStringBefore();
            this.lambdaStringAfter = this.getLambdaStringAfter();
            this.lambdaString = this.getLambdaString();
        }
      }
    }
  }

  private getLambdaStringBefore() : string {
    if (this.lambda.getParent() && this.lambda.getLambdaString()) {
      return this.lambda.getParent().substr(0, this.lambda.getParent().indexOf(this.lambda.getLambdaString()));
    } 
    return "";
  }

  private getLambdaStringAfter() : string {
    if (this.lambda.getParent() && this.lambda.getLambdaString()) {
     return this.lambda.getParent().substr(this.lambda.getParent().indexOf(this.lambda.getLambdaString()) + this.lambda.getLambdaString().length);
    } 
    return "";
  }

  private getLambdaString() : string {
    if (this.lambda.getLambdaString()) {
      return this.lambda.getLambdaString();
    } else {
      return this.lambda.toString();
    }
  }

}