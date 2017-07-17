import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { PackService } from './pack.service'
import { IReadOnly, ActionModel, ReadOnlyService, EditService, IKeyed } from './common'
import { TextEditModel } from './editable-text.component'
import { PriceEditModel } from './editable-price.component'

export class PackModel implements IReadOnly {
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
    private _service: PackService,
    private _editService: EditService,
    private _parent: PacksModel) {
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
    return this._service.update({id: this.id, property: 'name', value: this.name.potentialValue})
  }

  private confirmEditPrice(): Observable<any> {
    return this._service.update({id: this.id, property: 'price', value: this.price.potentialValue})
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

  _editService = new EditService()

  constructor(private _service: PackService) {
    this._editService.onEndEdit(this, () => {
      if(this.adding) {
        this.cancelAdd()
      }
    })
  }

  load() {
    this._service.all().subscribe(packs => {
      this.packs = packs.map(w => new PackModel(w.id, w.name, w.price, this._service, this._editService, this))
      this.loaded = true
    })
  }

  startAdd() {
    this.adding = new AddingPackModel()
    this._editService.startEdit(this)
  }

  confirmAdd() {
    let pack = new PackModel(0, this.adding.name, parseFloat(this.adding.price), this._service, this._editService, this)
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
  model = new PacksModel(new PackService())

  ngOnInit() {
    this.model.load()
  }
}