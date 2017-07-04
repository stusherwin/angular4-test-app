import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { TextEditModel } from './app.component'

@Component({
  selector: 'editable-text',
  templateUrl: './editable-text.component.html',
})
export class EditableTextComponent {
  @Input()
  model: TextEditModel
}