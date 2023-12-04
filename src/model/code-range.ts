import { Refactoring } from './refactoring';

export type DiffSide = "LEFT" | "RIGHT";
export class CodeRange {
    constructor(
        public readonly filePath: string,
        public readonly startLine: number,
        public readonly endLine: number,
        public readonly startColumn: number,
        public readonly endColumn: number,
        public readonly codeElementType: string,
        public readonly description: string,
        public readonly codeElement: string,
        public readonly refactoring: Refactoring,
        public readonly diffSide: DiffSide
    ) {}

    public getRefactoringLink() : string {
        let commit = this.refactoring.getCommit();
        let gh = commit.getProject().getCloneUrl().replace(".git", "");
        return gh + "/blob/" + commit.getID() + "/" + this.filePath + "#L" + this.startLine + "-L" + this.endLine;
    }
}