import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TOTS_CORE_PROVIDER, TotsCoreModule } from '@tots/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  TOTS_AUTH_PROVIDER,
  TotsAuthConfig,
  TotsAuthInterceptor,
  TotsAuthModule,
} from '@tots/auth';
import { TOTS_CLOUD_STORAGE_PROVIDER } from '@tots/cloud-storage';
import { TableComponent } from './components/table/table.component';
import { TotsTableModule } from '@tots/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TotsFormModule } from '@tots/form';

@NgModule({
  declarations: [AppComponent, TableComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,

    /** Tots Libraries */
    TotsCoreModule,
    TotsAuthModule,
    TotsTableModule,
    BrowserAnimationsModule,
    TotsFormModule,
  ],
  providers: [
    {
      provide: TOTS_CORE_PROVIDER,
      useValue: {
        baseUrl: 'https://agency-coda.uc.r.appspot.com/',
      },
    },
    {
      provide: TOTS_CLOUD_STORAGE_PROVIDER,
      useValue: {
        bucket: 'codahub-files',
      },
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TotsAuthInterceptor,
      multi: true,
    },
    {
      provide: TOTS_AUTH_PROVIDER,
      useValue: {
        signInPath: 'oauth/token',
        changePasswordPath: 'users/me/password',
      } as TotsAuthConfig,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
