import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { WidgetService } from './widget.service'
import { IReadOnly, ActionModel, ReadOnlyService, EditService, IKeyed } from './common'
import { TextEditModel } from './editable-text.component'
import { PriceEditModel } from './editable-price.component'

export class WidgetModel implements IReadOnly {
  add: ActionModel
  delete: ActionModel
  name: TextEditModel
  price: PriceEditModel
  private _readOnlyService = new ReadOnlyService()

  get isReadOnly() {
    return this._readOnlyService.isReadOnly
  }

  constructor(
    public id: number,
    name: string,
    price: number,
    private _service: WidgetService,
    private _editService: EditService,
    private _parent: WidgetsModel) {
      this.add = new ActionModel(
        'add:' + this.id,
        this._editService,
        this._readOnlyService,
        () => this.confirmAdd(),
        () => {},
        () => this._parent.abandonAdd(this))

      this.delete = new ActionModel(
        'delete:' + this.id,
        this._editService,
        this._readOnlyService,
        () => this.confirmDelete(),
        () => this._parent.deleteDone(this),
        () => {})

      this.name = new TextEditModel(
        'name:' + this.id,
        this._editService,
        this._readOnlyService,
        () => this.confirmEditName(),
        () => {},
        () => {},
        name)

      this.price = new PriceEditModel(
        'price:' + this.id,
        this._editService,
        this._readOnlyService,
        () => this.confirmEditPrice(),
        () => {},
        () => {},
        price)
  }

  private confirmAdd(): Observable<any> {
    return this._service.add({name: this.name.value, price: this.price.value})
      .do(r => this.id = r.id)
  }

  private confirmDelete(): Observable<any> {
    return this._service.delete(this.id)
  }

  private confirmEditName(): Observable<any> {
    return this._service.update()
  }

  private confirmEditPrice(): Observable<any> {
    return this._service.update()
  }
}

export class AddingWidgetModel {
  name = ''
  price = ''
}

export class WidgetsModel implements IKeyed {
  loaded = false
  adding: AddingWidgetModel
  widgets: WidgetModel[] = []
  editing: WidgetModel
  editingField: string
  key = 'add'

  _editService = new EditService()

  constructor(private _service: WidgetService) {
    this._editService.onEndEdit(this, () => {
      if(this.adding) {
        this.cancelAdd()
      }
    })
  }

  load() {
    this._service.all().subscribe(widgets => {
      this.widgets = widgets.map(w => new WidgetModel(w.id, w.name, w.price, this._service, this._editService, this))
      this.loaded = true
    })
  }

  startAdd() {
    this.adding = new AddingWidgetModel()
    this._editService.startEdit(this)
  }

  confirmAdd() {
    let widget = new WidgetModel(0, this.adding.name, parseFloat(this.adding.price), this._service, this._editService, this)
    this.adding = null
    this.widgets.unshift(widget)
    widget.add.confirm()
  }

  abandonAdd(widget: WidgetModel) {
    let ix = this.widgets.indexOf(widget)
    this.widgets.splice(ix, 1)
  }

  cancelAdd() {
    this.adding = null
    this._editService.endEdit(this)
  }

  deleteDone(widget: WidgetModel) {
    let ix = this.widgets.indexOf(widget)
    this.widgets.splice(ix, 1)
  }
}

@Component({
  selector: 'widgets',
  templateUrl: './widgets.component.html',
  styleUrls: ['./widgets.component.less']
})
export class WidgetsComponent implements OnInit {
  model = new WidgetsModel(new WidgetService())

  ngOnInit() {
    this.model.load()
  }
}