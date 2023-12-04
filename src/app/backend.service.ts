import { Project } from '../model/project';
import { Lambda } from '../model/lambda';
import { Commit } from '../model/commit';
import { Email } from '../model/email';
import { LambdaParameter } from '../model/lambda-parameter';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable'; 
import { User } from '../model/user';
import { Router } from '@angular/router';
import 'rxjs/Rx';
import { Refactoring } from 'model/refactoring';
import { RefactoringParameter } from 'model/refactoring-parameter';
import { CodeRange } from '../model/code-range';

@Injectable()
export class BackEndService {

  private readonly BACKEND_SERVER: string = "http://php/api.php";
  //private readonly BACKEND_SERVER: string = "http://localhost/RefactoringMinerBackEnd/api.php";

  constructor(private http: Http, private router: Router) { }

  public getProjects(): Observable<Project[]> {
    let url = this.BACKEND_SERVER + "?projects";
    return this.http.get(url)
      .map(res => {
        let projectsReturnedArray = res.json();
        let projects: Project[] = [];
        for (let project of projectsReturnedArray) {
          projects.push(this.getProjectObjFromProjectRow(project));
        }
        return projects;
      })
      .catch(error => this.handleError(error, url));
  }

  public getProject(projectID: number): Observable<Project> {
    let url = this.BACKEND_SERVER + "?projects&projectID=" + projectID;
    return this.http.get(url)
      .map(res => {
        let returnedJson = res.json();
        let project = returnedJson[0];
        return this.getProjectObjFromProjectRow(project);
      })
      .catch(error => this.handleError(error, url));
  }

  public getLambda(lambdaID: number, project: Project): Observable<Lambda> {
    let url = this.BACKEND_SERVER + "?lambdas&projectID=" + project.getID() + "&lambdaID=" + lambdaID +
      this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let returnedJson = res.json();
        let lambdas = this.getLambdasFromRow((row) => project, returnedJson, null);
        return lambdas[0];
      })
      .catch(error => this.handleError(error, url));
  }
  public getCodeRanges(refactoringID: number) : Observable<CodeRange[]> {
    let url = this.BACKEND_SERVER + "?coderanges&refactoringID=" + refactoringID;
    return this.http.get(url)
      .map(res => {
        let returnedJson = res.json();
        console.log(returnedJson);
        return returnedJson.map((range) => new CodeRange(
          range["filePath"],
          range["startLine"],
          range["endLine"],
          range["startColumn"],
          range["endColumn"],
          range["codeElementType"],
          range["description"],
          range["codeElement"],
          new Refactoring(range["refactoring"],new Commit(new Project(null, null, range["cloneUrl"], null, null, null, null, null, null, null, null, null), range["commitId"], null, null, null, null, null), null, range["startLine"], range["endLine"], 
          null, null, [], null, [], null, null, range["refactoringDescription"], range["refactoringType"]),
          range["diffSide"]))
        })
      .catch(error => this.handleError(error, url));
  }

  /* TODO: Implement this function */
  public getRefactoring(refactoringID: number, project: Project): Observable<Refactoring> {
    let url = this.BACKEND_SERVER + "?refactorings&projectID=" + project.getID() + "&refactoringID=" + refactoringID +
      this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let returnedJson = res.json();
        let refactorings = this.getRefactoringsFromRow((row) => project, returnedJson, null);
        return refactorings[0];
      })
      .catch(error => this.handleError(error, url));
  }

  /* TODO: Implement this function */
  public getRefactoringsFromRow(getProjectFunc, returned, mapExtraInfo): Refactoring[] {
    let refactorings: Refactoring[] = [];
    let commits: { [id: number]: Commit; } = {};
    for (let i = 0; i < returned.length; i++) {
      let row = returned[i];
      let commitRowID: number = parseInt(row["commitRowId"]);
      let commit: Commit = commits[commitRowID];
      if (typeof commit === "undefined") {
        commit = new Commit(getProjectFunc(row), commitRowID, row["commitId"], new Date(row["commitTime"].replace(/-/g, "/")), row["authorName"], row["authorEmail"], +row["authorRank"]);
        commits[commitRowID] = commit;
      }
      let parameters: RefactoringParameter[] = [];

      let tags = [];
      let tagRows = row["tags"];
      if (tagRows) {
        for (let j = 0; j < tagRows.length; j++) {
          tags.push(tagRows[j]["label"]);
        }
      }
      let refactoringLocationStatus = row["refactoringLocationStatus"] ? row["refactoringLocationStatus"] : "";
      let refactoringStatus = row["status"] ? row["status"] : row["refactoring_status"] ? row["refactoring_status"] : "";
      let refactoring = new Refactoring(row["refactoringId"], commit, row["filePath"], row["startLine"], row["endLine"], 
        row["fileMd5"], row["body"], parameters, refactoringStatus, tags, refactoringLocationStatus, row["parent"], row["refactoringString"], row["refactoringType"], row["isTestRefactoring"]);
      if (mapExtraInfo) {
        mapExtraInfo(refactoring, row);
      }
      refactorings.push(refactoring);
    }
    return refactorings;
  }
  /* TODO: Implement this function */
  public getAllRefactoringTags(): Observable<string[]> {
    let url = this.BACKEND_SERVER + "?allTags" + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let tags: string[] = [];
        let returned = res.json();
        for (let obj of returned) {
          tags.push(obj["label"]);
        }
        return tags;
      })
      .catch(error => this.handleError(error, url));
  }

  /* TODO: Implement this function */
  public getRefactorings(project: Project): Observable<Refactoring[]> {
    let url = this.BACKEND_SERVER + "?refactorings&projectID=" + project.getID();
    let res = this.http.get(url)
      .map(res => {
        let returned = res.json();
        let authorContacted = (refactoring, row) => {
          refactoring.authorContacted = row["authorContacted"] == 1;
        }
        return this.getRefactoringsFromRow((refactoringRow) => project, returned, authorContacted);
      })
      .catch(error => this.handleError(error, url));
    console.log(res);
    return res;
  }
  
  private getProjectObjFromProjectRow(project: any): Project {
    /*private id: number, private cloneUrl: string, private status: string, 
        private numberOfLambdas: number, private lastAnalyzed: Date, private shouldMonitor: boolean,
        private analyzed: boolean, private branch: string, private numberOfNewLambdas: number*/
    return new Project(project["id"], project["name"], project["cloneUrl"], project["status"],
      +project["numberOfLambdas"], new Date(project["last_update"].replace(/-/g, "/")), +project["monitoring_enabled"] == 1,
      +project["analyzed"] == 1, project["default_branch"], +project["numberOfNewLambdas"], +project["numberOfCommits"], +project["commits_count"]);
  }

  public setProjectMonitoring(projectID: number, shouldMonitor: boolean): Observable<Lambda[]> {
    let url = this.BACKEND_SERVER + "?monitorProject&projectID=" + projectID + "&shouldMonitor=" + shouldMonitor +
      this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => res.status)
      .catch(error => this.handleError(error, url));
  }

  public getLambdas(project: Project): Observable<Lambda[]> {
    let url = this.BACKEND_SERVER + "?lambdas&projectID=" + project.getID();
    return this.http.get(url)
      .map(res => {
        let returned = res.json();
        let authorContacted = (lambda, row) => {
          lambda.authorContacted = row["authorContacted"] == 1;
        }
        return this.getLambdasFromRow((lambdaRow) => project, returned, authorContacted);
      })
      .catch(error => this.handleError(error, url));
  }

  public getLambdasFromRow(getProjectFunc, returned, mapExtraInfo): Lambda[] {
    let lambdas: Lambda[] = [];
    let commits: { [id: number]: Commit; } = {};
    for (let i = 0; i < returned.length; i++) {
      let row = returned[i];
      let commitRowID: number = +row["commitRowID"];
      let commit: Commit = commits[commitRowID];
      if (typeof commit === "undefined") {
        commit = new Commit(getProjectFunc(row), commitRowID, row["commitSHA1"], new Date(row["commitTime"].replace(/-/g, "/")), row["authorName"], row["authorEmail"], +row["authorRank"]);
        commits[commitRowID] = commit;
      }
      let parameters: LambdaParameter[] = [];
      let parameterRows = row["parameters"];
      for (let j = 0; j < parameterRows.length; j++) {
        parameters.push(new LambdaParameter(parameterRows[j]["type"], parameterRows[j]["name"]));
      }

      let tags = [];
      let tagRows = row["tags"];
      if (tagRows) {
        for (let j = 0; j < tagRows.length; j++) {
          tags.push(tagRows[j]["label"]);
        }
      }
      let lambdaLocationStatus = row["lambdaLocationStatus"] ? row["lambdaLocationStatus"] : "";
      let lambdaStatus = row["lambda_status"] ? row["lambda_status"] : "";
      let lambda = new Lambda(row["id"], commit, row["filePath"], row["startLine"], row["endLine"], 
        row["fileMd5"], row["body"], parameters, lambdaStatus, tags, lambdaLocationStatus, row["parent"], row["lambdaString"]);
      if (mapExtraInfo) {
        mapExtraInfo(lambda, row);
      }
      lambdas.push(lambda);
    }
    return lambdas;
  }

  public skipLambda(lambda: Lambda, skip: boolean) {
    if (skip || (lambda.getStatus() === 'SKIPPED' && !skip)) {
      let url = this.BACKEND_SERVER + "?skipLambda&lambdaID=" + lambda.getID() + "&skip=" + skip + this.getJwtUrlComponent();
      return this.http.get(url)
        .map(res => {
          if (res.status) {
            if (skip) {
              lambda.setStatus('SKIPPED');
            } else {
              if (lambda.getStatus() == 'SKIPPED') {
                lambda.setStatus('NEW');
              }
            }
          }
          return res.status;
        })
      .catch(error => this.handleError(error, url));
    }
  }

  public skipRefactoring(lambda: Refactoring, skip: boolean) {
    if (skip || (lambda.getStatus() === 'SKIPPED' && !skip)) {
      let url = this.BACKEND_SERVER + "?skipLambda&lambdaID=" + lambda.getID() + "&skip=" + skip + this.getJwtUrlComponent();
      return this.http.get(url)
        .map(res => {
          if (res.status) {
            if (skip) {
              lambda.setStatus('SKIPPED');
            } else {
              if (lambda.getStatus() == 'SKIPPED') {
                lambda.setStatus('NEW');
              }
            }
          }
          return res.status;
        })
      .catch(error => this.handleError(error, url));
    }
  }

  public setTag(lambda: Lambda, tag: string, remove: boolean) {
    let mode: string = remove ? "remove" : "add";
    let url = this.BACKEND_SERVER + "?setTag&lambdaID=" + lambda.getID() + "&tag=" + encodeURIComponent(tag) + "&mode=" + mode + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        if (res.status == 200) {
          if (remove) {
            lambda.removeTag(tag);
          } else {
            lambda.addTag(tag);
          }
        }
        return res.status;
      })
      .catch(error => this.handleError(error, url));
  }

  public setRefactoringTag(lambda: Refactoring, tag: string, remove: boolean) {
    let mode: string = remove ? "remove" : "add";
    let url = this.BACKEND_SERVER + "?setTag&lambdaID=" + lambda.getID() + "&tag=" + encodeURIComponent(tag) + "&mode=" + mode + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        if (res.status == 200) {
          if (remove) {
            lambda.removeTag(tag);
          } else {
            lambda.addTag(tag);
          }
        }
        return res.status;
      })
      .catch(error => this.handleError(error, url));
  }

  public getAllLambdaTags(): Observable<string[]> {
    let url = this.BACKEND_SERVER + "?allTags" + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let tags: string[] = [];
        let returned = res.json();
        for (let obj of returned) {
          tags.push(obj["label"]);
        }
        return tags;
      })
      .catch(error => this.handleError(error, url));
  }

  public login(userName: string, password: string): Observable<Response> {
    this.logout();
    let url = this.BACKEND_SERVER + "?login&u=" + userName + "&p=" + password;
    return this.http.get(url)
      .map(res => {
        if (res.status == 200) {
          let returned = res.json();
          if (returned["jwt"]) {
            let token = returned["jwt"];
            localStorage.setItem("user", token);
          }
        }
        return res;
      })
      .catch(error => this.handleError(error, url));
  }

  public logout() {
    localStorage.removeItem("user");
    //this.router.navigate(['home']);
  }

  public getUser(): User {
    let user;
    if (localStorage.getItem("user")) {
      let token = localStorage.getItem("user");
      let base64 = token.split('.')[1];
      let dataObject = JSON.parse(window.atob(base64));
      let exp = +dataObject["exp"];
      if (exp * 1000 > new Date().getTime()) {
        let uID = dataObject["data"]["userID"];
        let uName = dataObject["data"]["userName"];
        let name = dataObject["data"]["name"];
        let familyName = dataObject["data"]["familyName"];
        let role = dataObject["data"]["role"];
        let email = dataObject["data"]["email"];
        user = new User(uID, uName, name, familyName, role, email, token);
      }
    }

    if (!user) {
      this.logout();
    }

    return user;
  }

  public getJwtUrlComponent() {
    return "&jwt=" + this.getUser().getJWT() + "&t=" + (new Date()).getTime();
  }

  public getEmailTemplate(lambda: Lambda): Observable<string> {

    let url = this.BACKEND_SERVER + "?getEmailTemplate&lambdaID=" + encodeURIComponent(lambda.getID().toString());

    url += this.getJwtUrlComponent();

    return this.http.get(url)
      .map(res => {
        return res.json()["template"];
      })
      .catch(error => this.handleError(error, url));
  }

  public getEmailTemplateRefactoring(refactoring: Refactoring): Observable<string> {

    let url = this.BACKEND_SERVER + "?getEmailTemplateRefactoring&refactoringID=" + encodeURIComponent(refactoring.getID().toString());

    url += this.getJwtUrlComponent();

    return this.http.get(url)
      .map(res => {
        return res.json()["template"];
      })
      .catch(error => this.handleError(error, url));
  }

  public sendEmail(to: string, toEmail: string, body: string, subject: string, lambdaID: number, sendMyself: boolean, revision?: Number): Observable<Response> {
    let rev = revision ? `&revision=${revision}` : "";
    let url = this.BACKEND_SERVER + "?sendEmail" +
      "&toEmail=" + encodeURIComponent(toEmail) +
      "&body=" + encodeURIComponent(body) +
      "&subject=" + encodeURIComponent(subject) +
      "&to=" + encodeURIComponent(to) +
      "&lambda=" + lambdaID +
      "&emailMyself=" + sendMyself +
      rev +
      this.getJwtUrlComponent();

    return this.http.get(url)
      .map(res => res)
      .catch(error => this.handleError(error, url));
  }

  public addAuthorEmail(fromEmail: string, body: string, subject: string, lambdaID: number): Observable<Response> {
    let user = this.getUser();
    let url = this.BACKEND_SERVER + "?addResponse" +
      "&body=" + encodeURIComponent(body) +
      "&subject=" + encodeURIComponent(subject) +
      "&fromEmail=" + encodeURIComponent(fromEmail) +
      "&lambda=" + lambdaID +
      this.getJwtUrlComponent();

    return this.http.get(url)
      .map(res => res)
      .catch(error => this.handleError(error, url));
  }

  public getEmailChain(lambda: Lambda): Observable<Email[]> {
    let url = this.BACKEND_SERVER + "?getMails&lambdaID=" + lambda.getID() + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let emails: Email[] = [];
        let returned = res.json();
        for (let emailRow of returned) {
          let email = new Email(lambda,
            emailRow["id"],
            emailRow["alternativeAddress"],
            emailRow["recipient"],
            emailRow["sentDate"],
            emailRow["body"],
            emailRow["sender"],
            emailRow["recipientIsUser"] == "1",
            emailRow["subject"]);
          emails.push(email);
        }
        return emails;
      })
      .catch(error => this.handleError(error, url));
  }

  public getRefactoringEmailChain(refactoring: Refactoring): Observable<Email[]> {
    let url = this.BACKEND_SERVER + "?getMails&refactoringID=" + refactoring.getID() + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let emails: Email[] = [];
        let returned = res.json();
        for (let emailRow of returned) {
          let email = new Email(null,
            emailRow["id"],
            emailRow["alternativeAddress"],
            emailRow["recipient"],
            emailRow["sentDate"],
            emailRow["body"],
            emailRow["sender"],
            emailRow["recipientIsUser"] == "1",
            emailRow["subject"],
            refactoring);
          emails.push(email);
        }
        return emails;
      })
      .catch(error => this.handleError(error, url));
  }

  public getEmailChainForEmail(email: string): Observable<Email[]> {
    let url = this.BACKEND_SERVER + "?getMails&email=" + encodeURIComponent(email) +
      this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let emails: Email[] = [];
        let returned = res.json();
        for (let emailRow of returned) {
          let email = new Email(null,
            emailRow["id"],
            emailRow["alternativeAddress"],
            emailRow["recipient"],
            emailRow["sentDate"],
            emailRow["body"],
            emailRow["sender"],
            emailRow["recipientIsUser"] == "1",
            emailRow["subject"]);
          emails.push(email);
        }
        return emails;
      })
      .catch(error => this.handleError(error, url));
  }

  public getRefactoringsEmailedFor(): Observable<any> {
    let url = this.BACKEND_SERVER + "?emailedRefactorings" + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let returned = res.json();
        let allTheRefactorings = [];
        let mapExtraInfo = (refactoring, row) => {
          refactoring["responded"] = row["responded"] == "1";
          refactoring["tagged"] = row["tagged"] == "1";
        };
        let myRefactorings = this.getRefactoringsFromRow((refactoringRow) => this.getProjectObjFromProjectRow(refactoringRow["project"]), returned["ByMe"], mapExtraInfo);
        let otherRefactorings = this.getRefactoringsFromRow((refactoringRow) => this.getProjectObjFromProjectRow(refactoringRow["project"]), returned["ByOthers"], mapExtraInfo);
        myRefactorings.forEach(refactoring => {
          refactoring["by"] = "Me";
          allTheRefactorings.push(refactoring);
        });
        otherRefactorings.forEach(refactoring => {
          refactoring["by"] = "Others";
          allTheRefactorings.push(refactoring);
        });
        return allTheRefactorings;
      })
      .catch(error => this.handleError(error, url));
  }

  public getLambdasEmailedFor(): Observable<any> {
    let url = this.BACKEND_SERVER + "?emailedLambdas" + this.getJwtUrlComponent();
    return this.http.get(url)
      .map(res => {
        let returned = res.json();
        let allTheLambdas = [];
        let mapExtraInfo = (lambda, row) => {
          lambda["responded"] = row["responded"] == "1";
          lambda["tagged"] = row["tagged"] == "1";
        };
        let myLambdas = this.getLambdasFromRow((lambdaRow) => this.getProjectObjFromProjectRow(lambdaRow["project"]), returned["ByMe"], mapExtraInfo);
        let otherLambdas = this.getLambdasFromRow((lambdaRow) => this.getProjectObjFromProjectRow(lambdaRow["project"]), returned["ByOthers"], mapExtraInfo);
        myLambdas.forEach(lambda => {
          lambda["by"] = "Me";
          allTheLambdas.push(lambda);
        });
        otherLambdas.forEach(lambda => {
          lambda["by"] = "Others";
          allTheLambdas.push(lambda);
        });
        return allTheLambdas;
      })
      .catch(error => this.handleError(error, url));
  }

  public getHeaders() {
    let headers = new Headers({ 'Authorization': 'Bearer ' + this.getUser().getJWT() });
    let options = new RequestOptions({ headers: headers });
    return options;
  }

  private handleError(error: Response | any, url: string) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string = url + "\n";
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    return Observable.throw(errMsg);
  }

}