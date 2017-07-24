import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { PackService } from './pack.service'
import { WidgetService } from './widget.service'
import { IReadOnly, ActionModel, ReadOnlyService, EditService, IKeyed, AddModel } from './common'
import { TextEditModel } from './editable-text.component'
import { PriceEditModel } from './editable-price.component'
import { QuantityEditModel } from './editable-quantity.component'
import 'rxjs/add/observable/combineLatest';

export class WidgetModel {
  add: ActionModel
  remove: ActionModel
  quantity: QuantityEditModel
  _readOnlyService: ReadOnlyService

  get isReadOnly() {
    return this._readOnlyService.isReadOnly
  }

  constructor(
   public id: number,
   public name: string,
   quantity: number,
   private _service: PackService,
   private _editService: EditService,
   readOnlyService: ReadOnlyService,
   private _parent: PackModel
  ) {
    this._readOnlyService = new ReadOnlyService(readOnlyService)

    this.add = new AddModel(
      'add:' + this._parent.id + ':' + this.id,
      this._editService,
      this._readOnlyService,
      () => this.confirmAdd(),
      () => {},
      () => this._parent.abandonAddWidget(this))

    this.remove = new ActionModel(
      'delete:' + this._parent.id + ':' + this.id,
      this._editService,
      this._readOnlyService,
      () => this.confirmRemove(),
      () => this._parent.removeWidgetDone(this),
      () => {})

    this.quantity = new QuantityEditModel(
      'quantity:' + this._parent.id + ':' + this.id,
      this._editService,
      this._readOnlyService,
      () => this.confirmEditQuantity(),
      () => {},
      () => {},
      quantity)
  }

  private confirmAdd(): Observable<any> {
    return this._service.addWidget({packId: this._parent.id, widgetId: this.id, quantity: this.quantity.value})
  }

  private confirmRemove(): Observable<any> {
    return this._service.removeWidget({packId: this._parent.id, widgetId: this.id})
  }

  private confirmEditQuantity(): Observable<any> {
    return this._service.updateWidget({packId: this._parent.id, widgetId: this.id, quantity: this.quantity.potentialValue})
  }
}

export class AddingWidgetModel {
  id: number
  quantity = '1'

  get name() {
    if(!this.id) {
      return ''
    }

    return this.options.find(w => w.id == this.id).name
  }

  constructor(
    public options: {id: number, name: string}[]
  ) {
    if(options.length) {
      this.id = options[0].id
    }
  }
}

export class PackModel implements IReadOnly {
  key: string
  add: ActionModel
  delete: ActionModel
  name: TextEditModel
  price: PriceEditModel
  widgets: WidgetModel[] = []

  adding: AddingWidgetModel
  
  private _readOnlyService = new ReadOnlyService()

  get isReadOnly() {
    return this._readOnlyService.isReadOnly
  }

  get remainingWidgets() {
    return this._allWidgets.filter(w => !this.widgets.find(x => x.id == w.id))
  }

  constructor(
    public id: number,
    name: string,
    price: number,
    widgets: {id: number, name: string, quantity: number}[],
    private _allWidgets: {id: number, name: string}[],
    private _service: PackService,
    private _editService: EditService,
    private _parent: PacksModel) {
      this.key = 'addWidget:' + id

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

      this.widgets = widgets.map(w => new WidgetModel(
        w.id,
        w.name,
        w.quantity,
        this._service,
        this._editService,
        this._readOnlyService,
        this))

      this._editService.onEndEdit(this, () => {
        if(this.adding) {
          this.cancelAddWidget()
        }
      })
  }

  private confirmAdd(): Observable<any> {
    return this._service.add({name: this.name.value, price: this.price.value})
      .do(r => this.id = r.id)
  }

  private confirmDelete(): Observable<any> {
    return this._service.delete(this.id)
  }

  private confirmEditName(): Observable<any> {
    return this._service.update({id: this.id, property: 'name', value: this.name.potentialValue})
  }

  private confirmEditPrice(): Observable<any> {
    return this._service.update({id: this.id, property: 'price', value: this.price.potentialValue})
  }

  startAddWidget() {
    this.adding = new AddingWidgetModel(this.remainingWidgets)
    this._editService.startEdit(this)
  }

  confirmAddWidget() {
    let widget = new WidgetModel(this.adding.id, this.adding.name, parseFloat(this.adding.quantity), this._service, this._editService, this._readOnlyService, this)
    this.adding = null
    this.widgets.unshift(widget)
    widget.add.confirm()
  }

  cancelAddWidget() {
    this.adding = null
    this._editService.endEdit(this)
  }

  abandonAddWidget(widget: WidgetModel) {
    let ix = this.widgets.indexOf(widget)
    this.widgets.splice(ix, 1)
  }

  removeWidgetDone(widget: WidgetModel) {
    let ix = this.widgets.indexOf(widget)
    this.widgets.splice(ix, 1)
  }
}

export class AddingPackModel {
  name = ''
  price = ''
}

export class PacksModel implements IKeyed {
  loaded = false
  adding: AddingPackModel
  packs: PackModel[] = []
  editing: PackModel
  editingField: string
  key = 'add'

  private _editService = new EditService()
  private _allWidgets: {id: number, name: string}[]
    
  constructor(
    private _packService: PackService,
    private _widgetService: WidgetService
  ) {
    this._editService.onEndEdit(this, () => {
      if(this.adding) {
        this.cancelAdd()
      }
    })
  }

  load() {
    Observable.combineLatest(
      this._packService.all(),
      this._widgetService.all(),
      (packs, widgets) => ({ packs, widgets })
    ).subscribe(({packs, widgets}) => {
      this._allWidgets = widgets
      this.packs = packs.map(p => new PackModel(p.id, p.name, p.price, p.widgets, this._allWidgets, this._packService, this._editService, this))
      this.loaded = true
    })
  }

  startAdd() {
    this.adding = new AddingPackModel()
    this._editService.startEdit(this)
  }

  confirmAdd() {
    let pack = new PackModel(0, this.adding.name, parseFloat(this.adding.price), [], this._allWidgets, this._packService, this._editService, this)
    this.adding = null
    this.packs.unshift(pack)
    pack.add.confirm()
  }

  abandonAdd(pack: PackModel) {
    let ix = this.packs.indexOf(pack)
    this.packs.splice(ix, 1)
  }

  cancelAdd() {
    this.adding = null
    this._editService.endEdit(this)
  }

  deleteDone(pack: PackModel) {
    let ix = this.packs.indexOf(pack)
    this.packs.splice(ix, 1)
  }
}

@Component({
  selector: 'packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.less']
})
export class PacksComponent implements OnInit {
  model = new PacksModel(new PackService(), new WidgetService())

  ngOnInit() {
    this.model.load()
  }
}