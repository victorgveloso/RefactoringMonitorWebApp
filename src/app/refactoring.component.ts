import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackEndService } from './backend.service';
import { Refactoring } from '../model/refactoring';
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
  selector: 'refactoring',
  templateUrl: './refactoring.component.html',
  providers: [BackEndService],
})
export class RefactoringComponent {
  private refactoring: Refactoring;
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

  public skipRefactoring() {
    this.backendService.skipRefactoring(this.refactoring, true)
      .subscribe(res => { });
  }

  public unskipRefactoring() {
    this.backendService.skipRefactoring(this.refactoring, false)
      .subscribe(res => { });
  }

  public tagAdded(tag) {
    this.backendService.setRefactoringTag(this.refactoring, tag, false)
      .subscribe(res => { });
  }

  public tagRemoved(tag) {
    this.backendService.setRefactoringTag(this.refactoring, tag, true)
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
    this.backendService.addAuthorEmail(this.commit.getAuthorEmail(), this.emailBody, this.emailSubject, this.refactoring.getID())
      .subscribe(
        res => this.handleEmailResponseAdded(res),
        err => this.handleEmailResponseAddedError(err)
      );
  }

  public handleEmailResponseAdded(res: any) {
    let message = "Successfully added response from " + this.refactoring.getCommit().getAuthorEmail();
    this.messageStatus = { "ok": true, "class": "alert-success", "message": message };
    this.refreshEmails();
    this.hideEmailBlock();
  }
  
  public handleEmailResponseAddedError(err: any) {
    let message = "Adding response from " + this.refactoring.getCommit().getAuthorEmail() + " failed.";
    this.messageStatus = { "ok": false, "class": "alert-danger", "message": message };
    console.log(err);
  }

  public sendEmail() {
    this.backendService.sendEmail(this.commit.getAuthor(), this.commit.getAuthorEmail(), this.emailBody, this.emailSubject, this.refactoring.getID(), this.emailMyself,this.commit.getID(), this.commit.getProject().getID())
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
      let message = "Successfully sent email to " + this.refactoring.getCommit().getAuthorEmail();
      this.messageStatus = { "ok": true, "class": "alert-success", "message": message };
      this.refreshEmails();
      this.hideEmailBlock();
  }

  public showMailSendError(obj: any) {
    let message = "Sending email to " + this.refactoring.getCommit().getAuthorEmail() + " failed.";
    this.messageStatus = { "ok": false, "class": "alert-danger", "message": message };
    console.log(obj);
  }

  public refreshEmails() {
    this.backendService.getRefactoringEmailChain(this.refactoring).subscribe(
      emails => this.emails = emails,
      console.error
    );
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      let refactoringID = +params['id'];
      let projectID = +params['project']
      this.backendService.getProject(projectID).subscribe(
        project => {
          this.backendService.getRefactoring(refactoringID, project).subscribe(
            refactoring => {
              this.refactoring = refactoring;
              this.commit = refactoring.getCommit();
              this.project = this.commit.getProject();
              this.tags = refactoring.getTags();
              this.backendService.getEmailTemplateRefactoring(refactoring).subscribe(
                emailTemplate => {
                  this.emailTemplate = emailTemplate;
                },
                console.error
              );
              this.refreshEmails();
               this.backendService.getEmailChainForEmail(this.commit.getAuthorEmail()).subscribe(
                emails => {
                  if (emails && emails.length > 0) {
                    this.messageStatus = { "ok": false, "class": "alert-warning", "message": this.commit.getAuthor() + " has been already contacted!" };
                  }
                },
                console.error
              );
            },
            console.error);
        }
      );
      this.backendService.getAllRefactoringTags().subscribe(
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