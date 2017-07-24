import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { StatusIndicatorComponent } from './status-indicator.component';
import { EditableTextComponent } from './editable-text.component';
import { EditablePriceComponent } from './editable-price.component';
import { EditableQuantityComponent } from './editable-quantity.component';
import { WidgetsComponent } from './widgets.component'
import { PacksComponent } from './packs.component'
import { HomeComponent } from './home.component'

@NgModule({
  declarations: [
    AppComponent,
    StatusIndicatorComponent,
    EditableTextComponent,
    EditablePriceComponent,
    EditableQuantityComponent,
    WidgetsComponent,
    PacksComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        component: HomeComponent
      }, ///packs/sub2/subsub2/subsubsub1
      {
        path: 'packs/sub2/subsub1/subsubsub1',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2/subsub1/subsubsub2',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2/subsub2/subsubsub1',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2/subsub2/subsubsub2',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2/subsub1',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2/subsub2',
        component: PacksComponent,
      },
      {
        path: 'packs/sub1',
        component: PacksComponent,
      },
      {
        path: 'packs/sub2',
        component: PacksComponent,
      },
      {
        path: 'packs',
        component: PacksComponent,
      },
      {
        path: 'widgets',
        component: WidgetsComponent
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }