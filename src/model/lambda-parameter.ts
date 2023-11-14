export class LambdaParameter {

    constructor(private type:string, private name:string) {}

    getType() : string { return this.type; }
    getName() : string { return this.name; }

}