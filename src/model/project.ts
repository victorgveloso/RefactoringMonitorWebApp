export class Project {

    static readonly GITHUB_ADDRESS: string = "https://github.com/";
    
    constructor(private id: number, private name: string, private cloneUrl: string, private status: string, 
        private numberOfLambdas: number, private lastAnalyzed: Date, private shouldMonitor: boolean,
        private analyzed: boolean, private branch: string, private numberOfNewLambdas: number, private numberOfCommits: number, 
        private commits_count: number) {}

    public getGithubName() : string {
        return this.cloneUrl.replace(Project.GITHUB_ADDRESS, "");
    }
    
    public getID() { return this.id; }
    public getName() { return this.name; }
    public getCloneUrl() { return this.cloneUrl; }
    public getStatus() { return this.status; }
    public getNumberOfLambdas() { return this.numberOfLambdas; }
    public getLastAnalyzed() { return this.lastAnalyzed; }
    public getShouldMonitor() { return this.shouldMonitor; }
    public getAnalyzed() { return this.analyzed; }
    public getDefaultBranch() { return this.branch; }
    public getNumberOfNewLambdas() { return this.numberOfNewLambdas; }
    public getNumberOfCommits() { return this.numberOfCommits; }
    public getCommitsCount() { return this.commits_count; }

}