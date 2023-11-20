import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home.component'; //import home components
import { ProjectDetailsComponent } from './project-details.component'; //import about component
import { LambdaComponent } from './lambda.component';
import { EmailsComponent } from './emails.component';
import { AuthGuard } from './auth.guard';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'emails', component: EmailsComponent, canActivate: [AuthGuard] },
  { path: 'project-details/:id', component: ProjectDetailsComponent },
  { path: 'lambda/:project/:id', component: LambdaComponent, canActivate: [AuthGuard] },
  { path: '', component: HomeComponent, pathMatch: 'full'}, // redirect to home page on load
  { path: '**', redirectTo: '' }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);