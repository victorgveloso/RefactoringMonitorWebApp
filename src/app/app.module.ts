import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

import { routing } from './app.routing'

import { RlTagInputModule } from 'angular2-tag-input';

import { HeaderComponent } from './header.component';
import { JumbotronComponent } from './jumbotron.component';
import { ProjectsTableComponent } from './projects-table.component';
import { HomeComponent } from './home.component';
import { ProjectDetailsComponent } from './project-details.component';
import { LambdasTableComponent } from './lambdas-table.component';
import { PaginatorComponent } from './paginator.component';
import { LambdaComponent } from './lambda.component';
import { EmailsComponent } from './emails.component';
import { EmailsTableComponent } from './emails-table.component';
import { LambdaCodeComponent } from './lambda-code.component';

import { SimpleTinyComponent } from './tinymce.component';

import { AuthGuard } from './auth.gaurd';
import { BackEndService } from './backend.service';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    JumbotronComponent,
    ProjectsTableComponent,
    HomeComponent,
    ProjectDetailsComponent,
    LambdasTableComponent,
    PaginatorComponent,
    LambdaComponent,
    SimpleTinyComponent,
    EmailsComponent,
    EmailsTableComponent,
    LambdaCodeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    RlTagInputModule
  ],
  providers: [AuthGuard, BackEndService],
  bootstrap: [AppComponent]
})
export class AppModule { }
