import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { StatusIndicatorComponent } from './status-indicator.component';
import { EditableTextComponent } from './editable-text.component';
import { EditablePriceComponent } from './editable-price.component';

@NgModule({
  declarations: [
    AppComponent, StatusIndicatorComponent, EditableTextComponent, EditablePriceComponent
  ],
  imports: [
    BrowserModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
