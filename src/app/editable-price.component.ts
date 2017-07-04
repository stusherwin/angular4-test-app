import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { PriceEditModel } from './app.component'

@Component({
  selector: 'editable-price',
  templateUrl: './editable-price.component.html',
})
export class EditablePriceComponent {
  @Input()
  model: PriceEditModel
}