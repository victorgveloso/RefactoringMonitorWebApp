import { RefactoringParameter } from './refactoring-parameter';
import { Commit } from "./commit";

export class Refactoring {

    constructor(private id : number, private commit: Commit, private file, private startLine: number, private endLine: number,
        private fileMd5 : string,
        private body: string, private parameters: RefactoringParameter[], private status: string, private tags: string[],
        private locationStatus: string, private parent: string, private refactoringString: string, private refactoringType?: string, public readonly isTestRefactoring: string = "0") {}

    public getID() : number { return this.id; }
    public getCommit() : Commit { return this.commit; }
    public getStartLine() : number { return this.startLine; }
    public getEndLine() : number { return this.endLine; }
    public getBody() : string { return this.body; }
    public getStatus() : string { return this.status; }
    public getFile() : string { return this.file; }
    public getTags() : string[] { return this.tags; }
    public getLocationStatus() : string { return this.locationStatus; }
    public getParent() : string { return this.parent; }
    public getRefactoringString() : string { return this.refactoringString; }
    public getRefactoringType() : string { return this.refactoringType; }

    public toString() : string {
        let valueToReturn : string = "(";
        for (let i = 0; i < this.parameters.length; i++) {
            let type = this.parameters[i].getType() !== "" ? this.parameters[i].getType() + " " : ""; 
            valueToReturn += type + this.parameters[i].getName();
            if (i < this.parameters.length - 1) {
                valueToReturn += ", ";
            }
        }
        valueToReturn += ") -> " + this.body;
        return valueToReturn;
    }

    public getRefactoringLink() : string {
        let gh = this.commit.getProject().getCloneUrl().replace(".git", "");
        return gh + "/blob/" + this.commit.getSHA1() + "/" + this.file + "#L" + this.startLine + "-L" + this.endLine;
    }

    public getCommitDiffLink() : string {
        return this.commit.getLink() + "#diff-" + this.fileMd5 + "R" + this.startLine;
    }

    public setStatus(status: string) {
        this.status = status;
    }

    public addTag(tag) {
        if (this.tags.indexOf(tag) < 0, 0) {
            this.tags.push(tag);
        }
    }

    public removeTag(tag) {
        var index = this.tags.indexOf(tag, 0);
        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }

    public static getPrettyStatus(status: string) : string {
        let toReturn = status.replace("IN_", "").replace("_", " ").toLowerCase();
        toReturn = toReturn.substring(0, 1).toUpperCase() + toReturn.substring(1);
        return toReturn;
    }

}