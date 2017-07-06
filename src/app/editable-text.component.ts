import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { EditModel, EditService, ReadOnlyService } from './common'
import { Observable } from 'rxjs/Observable'

export class TextEditModel extends EditModel {
  editingValue: string

  constructor(
    key: string,
    editService: EditService,
    readOnlyService: ReadOnlyService,
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
    public value: string
  ) {
    super(key, editService, readOnlyService, _confirm, _done, _abandon)
    this.editingValue = this.value
  }

  protected success() {
    super.success()
    this.value = this.editingValue
  }

  protected clear() {
    super.clear()
    this.editingValue = this.value
  }
}

@Component({
  selector: 'editable-text',
  templateUrl: './editable-text.component.html',
})
export class EditableTextComponent {
  @Input()
  model: TextEditModel
}