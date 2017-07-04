import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'  
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/dematerialize'
import 'rxjs/add/operator/do'
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

export class ActionModel {
  status: string = ''
  errorMessage: string = ''

  constructor(
    private _confirm: () => Observable<any>,
    private _done: () => void,
    private _abandon: () => void
  ) {
  }

  get isInProgress() {
    return this.status && this.status == 'inProgress'
  }

  get isSuccess() {
    return this.status && this.status == 'success' || this.status == 'done'
  }

  get isError() {
    return this.status && this.status == 'error'
  }

  get isDone() {
    return this.status && this.status == 'done'
  }

  confirm() {
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
  }

  private done() {
    this.status = 'done'
    this._done()
  }

  protected clear() {
    this.status = null
    this.errorMessage = null
  }

  retry() {
    this.confirm()
  }

  abandon() {
    this.clear()
    this._abandon()
  }
}

export class EditModel extends ActionModel {
  editing: boolean

  constructor(
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
  ) {
    super(_confirm, _done, _abandon)
  }

  start() {
    this.editing = true
  }

  cancel() {
    this.clear()
  }

  protected success() {
    super.success()
  }

  protected clear() {
    super.clear()
    this.editing = false
  }
}

export class TextEditModel extends EditModel {
  editingValue: string

  constructor(
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
    public value: string
  ) {
    super(_confirm, _done, _abandon)
    this.editingValue = this.value
  }

  protected success() {
    super.success()
    this.value = this.editingValue
  }

  protected clear() {
    super.clear()
    this.editing = false
    this.editingValue = this.value
  }
}

export class PriceEditModel extends EditModel {
  editingValue: string

  constructor(
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
    public value: number
  ) {
    super(_confirm, _done, _abandon)
    this.editingValue = this.value.toFixed(2)
  }

  protected success() {
    super.success()
    this.value = parseFloat(this.editingValue)
  }

  protected clear() {
    super.clear()
    this.editing = false
    this.editingValue = this.value.toFixed(2)
  }
}

export class WidgetModel {
  add: ActionModel
  delete: ActionModel
  name: TextEditModel
  price: PriceEditModel

  constructor(
    public id: number,
    name: string,
    price: number,
    private _service: WidgetService,
    private _parent: WidgetsModel) {
      this.add = new ActionModel(
        () => this.confirmAdd(),
        () => {},
        () => this._parent.abandonAdd(this))

      this.delete = new ActionModel(
        () => this.confirmDelete(),
        () => this._parent.deleteDone(this),
        () => {})

      this.name = new TextEditModel(
        () => this.confirmEditName(),
        () => {},
        () => {},
        name)

      this.price = new PriceEditModel(
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

export class WidgetsModel {
  loaded = false
  adding: AddingWidgetModel
  widgets: WidgetModel[] = []
  editing: WidgetModel
  editingField: string

  constructor(private _service: WidgetService) {
  }

  load() {
    this._service.all().subscribe(widgets => {
      this.widgets = widgets.map(w => new WidgetModel(w.id, w.name, w.price, this._service, this))
      this.loaded = true
    })
  }

  startAdd() {
    this.adding = new AddingWidgetModel()
  }

  confirmAdd() {
    let widget = new WidgetModel(0, this.adding.name, parseFloat(this.adding.price), this._service, this)
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