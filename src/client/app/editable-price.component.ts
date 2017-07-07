import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { EditModel, EditService, ReadOnlyService } from './common'
import { Observable } from 'rxjs/Observable'

export class PriceEditModel extends EditModel {
  editingValue: string

  get potentialValue(): number {
    return parseFloat(this.editingValue)
  }

  constructor(
    key: string,
    editService: EditService,
    readOnlyService: ReadOnlyService,
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
    public value: number
  ) {
    super(key, editService, readOnlyService, _confirm, _done, _abandon)
    this.editingValue = this.value.toFixed(2)
  }

  protected success() {
    super.success()
    this.value = this.potentialValue
  }

  protected clear() {
    super.clear()
    this.editingValue = this.value.toFixed(2)
  }
}

@Component({
  selector: 'editable-price',
  templateUrl: './editable-price.component.html',
})
export class EditablePriceComponent {
  @Input()
  model: PriceEditModel
}