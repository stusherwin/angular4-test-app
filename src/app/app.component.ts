import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'  
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/dematerialize'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'
import { Subject } from 'rxjs/Subject'

export class ApiAddWidgetRequest {
  name: string
  price: number
}

export class ApiAddWidgetResponse {
  id: number
}

export class ApiWidget {
  id: number
  name: string
  price: number
}

export class WidgetService {
  fail = false

  private widgets: ApiWidget[] = [
    {id: 1, name: 'Left-handed widget', price: 14.99},
    {id: 2, name: 'Right-handed widget', price: 13.99},
    {id: 3, name: 'Screw confobulator', price: 23.50}
  ]
  nextId = 4

  all(): Observable<ApiWidget[]> {
    return Observable.of(this.widgets).delay(3000);
  }

  add(request: ApiAddWidgetRequest): Observable<ApiAddWidgetResponse> {
    if(!this.fail) {
      this.fail = true
      let id = this.nextId++

      return Observable.of({
        id: id,
        name: request.name,
        price: request.price
      }).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not add this widget').materialize().delay(3000).dematerialize()
  }

  delete(id: number): Observable<void> {
    if(!this.fail) {
      this.fail = true
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not delete this widget').materialize().delay(3000).dematerialize()
  }

  update(): Observable<void> {
    if(!this.fail) {
      this.fail = true
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not update this widget').materialize().delay(3000).dematerialize()
  }
}

export interface IKeyed {
  key: string
}

export interface IReadOnly {
  isReadOnly: boolean
}

export class ReadOnlyService implements IReadOnly {
  private _isReadOnly = false

  get isReadOnly() { return this._isReadOnly }

  readOnly() {
    this._isReadOnly = true
  }

  readWrite() {
    this._isReadOnly = false
  }
}

export class EditService {
  private _currentlyEditingKey: string
  private _currentlyEditingSubject = new Subject<string>()
  
  startEdit(item: IKeyed) {
    this._currentlyEditingKey = item.key
    this._currentlyEditingSubject.next(item.key)
  }

  endEdit(item: IKeyed) {
    if(this._currentlyEditingKey == item.key) {
      this._currentlyEditingKey = null
      this._currentlyEditingSubject.next(null)
    }
  }

  onEndEdit(item: IKeyed, action: () => void) {
    this._currentlyEditingSubject.filter(k => k != item.key).subscribe(action)
  }
}

export class ActionModel implements IKeyed, IReadOnly {
  status: string = ''
  errorMessage: string = ''

  constructor(
    public key: string,
    protected _editService: EditService,
    protected _readOnlyService: ReadOnlyService,
    private _confirm: () => Observable<any>,
    private _done: () => void,
    private _abandon: () => void
  ) {
    this._editService.onEndEdit(this, () => {
      if(this.isError) {
        this.abandon()
      }
    })
  }

  get isInProgress() {
    return this.status == 'inProgress'
  }

  get isSuccess() {
    return this.status == 'success' || this.status == 'done'
  }

  get isError() {
    return this.status == 'error'
  }

  get isDone() {
    return this.status == 'done'
  }

  get isReadOnly() {
    return this._readOnlyService.isReadOnly
  }

  confirm() {
    this._editService.startEdit(this)
    this._readOnlyService.readOnly()

    this.status = 'inProgress'
    this._confirm().subscribe(
      r => {
        this.success()
        setTimeout(() => {
          this.done()
          setTimeout(() => {
            this.clear()
          }, 250)
        }, 500)
      },
      e => {
        this.error(e)
      })
  }

  protected success() {
    this.status = 'success'
  }

  private error(errorMessage: string) {
    this.status = 'error'
    this.errorMessage = errorMessage
    this._readOnlyService.readWrite()    
  }

  private done() {
    this.status = 'done'
    this._done()
  }

  protected clear() {
    this.status = null
    this.errorMessage = null
    this._editService.endEdit(this)
    this._readOnlyService.readWrite()    
  }

  protected retry() {
    this.confirm()
  }

  protected abandon() {
    this.clear()
    this._abandon()
  }
}

export class EditModel extends ActionModel {
  editing = false

  constructor(
    key: string,
    editService: EditService,
    readOnlyService: ReadOnlyService,
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
  ) {
    super(key, editService, readOnlyService, _confirm, _done, _abandon)
    this._editService.onEndEdit(this, () => {
      if(this.editing) {
        this.cancel() 
      }
    })
  }

  start() {
    this.editing = true
    this._editService.startEdit(this)
  }

  cancel() {
    this.editing = false
    this.clear()
  }

  protected success() {
    super.success()
  }
}

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

export class PriceEditModel extends EditModel {
  editingValue: string

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
    this.value = parseFloat(this.editingValue)
  }

  protected clear() {
    super.clear()
    this.editingValue = this.value.toFixed(2)
  }
}

export class WidgetModel implements IReadOnly {
  add: ActionModel
  delete: ActionModel
  name: TextEditModel
  price: PriceEditModel
  _readOnlyService: ReadOnlyService

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
      this._readOnlyService = new ReadOnlyService()

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  model = new WidgetsModel(new WidgetService())

  ngOnInit() {
    this.model.load()
  }
}