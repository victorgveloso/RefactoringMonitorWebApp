import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackEndService } from './backend.service';
import { Lambda } from '../model/lambda';
import { Commit } from '../model/commit';
import { Project } from '../model/project';
import { Email } from '../model/email';

export enum EmailBlockMode {
  None = 0,
  ReplyEmail,
  BlankEmail,
  TemplateEmail,
  AddResponse
}

@Component({
  selector: 'lambda',
  templateUrl: './lambda.component.html',
  providers: [BackEndService],
})
export class LambdaComponent {
  private lambda: Lambda;
  private commit: Commit;
  private project: Project;
  private sub: any;
  public tags: string[] = [];
  public autocompleteItems: string[] = [];
  private messageStatus;
  private emails: Email[] = [];
  private emailSubject: string;
  private emailBody: string;
  private emailTemplate: string;
  private emailBlockModeEnum = EmailBlockMode;
  private emailBlockMode: EmailBlockMode = EmailBlockMode.None;
  private emailMyself: boolean = false;


  constructor(private route: ActivatedRoute, private backendService: BackEndService) {
  }

  public skipLambda() {
    this.backendService.skipLambda(this.lambda, true)
      .subscribe(res => { });
  }

  public unskipLambda() {
    this.backendService.skipLambda(this.lambda, false)
      .subscribe(res => { });
  }

  public tagAdded(tag) {
    this.backendService.setTag(this.lambda, tag, false)
      .subscribe(res => { });
  }

  public tagRemoved(tag) {
    this.backendService.setTag(this.lambda, tag, true)
      .subscribe(res => { });
  }

  public initiateReplyEmail(email: Email) {
    let replyEmailBodyTemplate = `
      <p></p>
      <p></p>
      <p>On {%DATE%} {%AUTHOR%} wrote:<p>
      {%MESSAGE%}
      `;
    let body = "<blockquote>" + email.getBody() + "</blockquote>";
    //let body = email.getBody().replace(/(\<p.*?>|<br\s*?[\/]{0,1}>|<li.*?>)/g, "$1&gt;");
    this.emailBody = replyEmailBodyTemplate.replace(/\{\%DATE\%\}/, email.getDate().toString())
      .replace(/\{\%AUTHOR\%\}/, email.getSender())
      .replace(/\{\%MESSAGE\%\}/, body);
    this.emailSubject = "Re: " + email.getSubject();
    this.emailBlockMode = EmailBlockMode.ReplyEmail;

  }

  public initiateBlankEmail() {
    this.emailBody = "";
    this.emailSubject = "";
    this.emailBlockMode = EmailBlockMode.BlankEmail;

  }

  public hideEmailBlock() {
    this.emailBlockMode = EmailBlockMode.None;
  }

  public initiateAddResponse() {
    this.emailBody = "";
    if (this.emails && this.emails.length > 0) {
      this.emailSubject = "Re: " + this.emails[this.emails.length - 1].getSubject();
    }
    this.emailBlockMode = EmailBlockMode.AddResponse;
  }

  public addResponse() {
    this.backendService.addAuthorEmail(this.commit.getAuthorEmail(), this.emailBody, this.emailSubject, this.lambda.getID())
      .subscribe(
        res => this.handleEmailResponseAdded(res),
        err => this.handleEmailResponseAddedError(err)
      );
  }

  public handleEmailResponseAdded(res: any) {
    let message = "Successfully added response from " + this.lambda.getCommit().getAuthorEmail();
    this.messageStatus = { "ok": true, "class": "alert-success", "message": message };
    this.refreshEmails();
    this.hideEmailBlock();
  }
  
  public handleEmailResponseAddedError(err: any) {
    let message = "Adding response from " + this.lambda.getCommit().getAuthorEmail() + " failed.";
    this.messageStatus = { "ok": false, "class": "alert-danger", "message": message };
    console.log(err);
  }

  public sendEmail() {
    this.backendService.sendEmail(this.commit.getAuthor(), this.commit.getAuthorEmail(), this.emailBody, this.emailSubject, this.lambda.getID(), this.emailMyself)
      .subscribe(
        res => this.handleEmailSentResponse(res),
        err => this.showMailSendError(err)
      );
  }

  public keyupHandlerFunction(newText: string) {
    this.emailBody = newText;
  }

  public action() {
    if (this.emailBody && this.emailSubject) {
      switch (this.emailBlockMode) {
        case this.emailBlockModeEnum.AddResponse:
          this.addResponse();
          break;
        case this.emailBlockModeEnum.BlankEmail:
        case this.emailBlockModeEnum.ReplyEmail:
        case this.emailBlockModeEnum.TemplateEmail:
          this.sendEmail();
          break;
        case this.emailBlockModeEnum.None:
        default:
          break;
      }
    }
  }

  public initiateTemplateEmail() {
    this.emailBlockMode = EmailBlockMode.TemplateEmail;
    this.emailSubject = "Question about your recent commit to " + this.project.getName();
    this.emailBody = this.emailTemplate;
  }

  public handleEmailSentResponse(res: any) {
    if (res.status === 200 && res.json()["status"] === "OK") {
      this.handleEmailSuccessful(res);
    } else {
      this.showMailSendError(res);
    }
  }

  public handleEmailSuccessful(res: any) {
      let message = "Successfully sent email to " + this.lambda.getCommit().getAuthorEmail();
      this.messageStatus = { "ok": true, "class": "alert-success", "message": message };
      this.refreshEmails();
      this.hideEmailBlock();
  }

  public showMailSendError(obj: any) {
    let message = "Sending email to " + this.lambda.getCommit().getAuthorEmail() + " failed.";
    this.messageStatus = { "ok": false, "class": "alert-danger", "message": message };
    console.log(obj);
  }

  public refreshEmails() {
    this.backendService.getEmailChain(this.lambda).subscribe(
      emails => this.emails = emails,
      error => console.log(<any>error)
    );
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let lambdaID = +params['id'];
      let projectID = +params['project']
      this.backendService.getProject(projectID).subscribe(
        project => {
          this.backendService.getLambda(lambdaID, project).subscribe(
            lambda => {
              this.lambda = lambda;
              this.commit = lambda.getCommit();
              this.project = this.commit.getProject();
              this.tags = lambda.getTags();
              this.backendService.getEmailTemplate(lambda).subscribe(
                emailTemplate => {
                  this.emailTemplate = emailTemplate;
                },
                error => console.log(<any>error)
              );
              this.refreshEmails();
               this.backendService.getEmailChainForEmail(this.commit.getAuthorEmail()).subscribe(
                emails => {
                  if (emails && emails.length > 0) {
                    this.messageStatus = { "ok": false, "class": "alert-warning", "message": this.commit.getAuthor() + " has been already contacted!" };
                  }
                },
                error => console.log(<any>error)
              );
            },
            error => console.log(<any>error));
        }
      );
      this.backendService.getAllLambdaTags().subscribe(
        tags => {
          this.autocompleteItems = tags;
        }
      );
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}