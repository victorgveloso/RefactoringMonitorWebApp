import { Project } from './project';

export class Commit {
    
    constructor(private project : Project,
    private id: number, private sha1: string, private date:Date, private author:string, private authorEmail:string, private authorRank, private message: string) {}

    public getID() : number { return this.id; }
    public getSHA1() : string { return this.sha1; }
    public getDate() : Date { return this.date; }
    public getAuthor() : string { return this.author; }
    public getAuthorEmail() : string { return this.authorEmail; }
    public getProject() : Project { return this.project; }
    public getAuthorRank() : number { return this.authorRank; }
    public getMessage() : string { return this.message; }
    
    public getLink() : string {
        let gh = this.project.getCloneUrl().replace(".git", "");
        return `${gh}/commit/${this.sha1}`;
    }
}