import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'  
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/dematerialize'

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
}

export class WidgetModel {
  action: string
  status: string
  errorMessage: string

  constructor(
    public id: number,
    public name: string,
    public price: number,
    private _parent: WidgetsModel) {
  }
  
  delete() {
    this._parent.delete(this)
  }

  start(action: string) {
    this.action = action
    this.status = 'inProgress'
  }

  success() {
    this.status = 'success'
  }

  error(errorMessage: string) {
    this.status = 'error'
    this.errorMessage = errorMessage
  }

  end() {
    this.status = 'done'
  }

  clear() {
    this.status = null
    this.action = null
    this.errorMessage = null
  }

  retryAdd() {
    this._parent.retryAdd(this)
  }

  abandonAdd() {
    this._parent.abandonAdd(this) 
  }

  abandonDelete() {
    this.clear()
  }

  edit(field: string) {
    this._parent.startEdit(this, field)
  }

  isEditing(field: string) {
    return this._parent.isEditing(this, field)
  }

  cancelEdit() {
    this._parent.cancelEdit()
  }

  confirmEdit() {
    this._parent.cancelEdit()
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
      this.widgets = widgets.map(w => new WidgetModel(w.id, w.name, w.price, this))
      this.loaded = true
    })
  }

  startAdd() {
    this.adding = new AddingWidgetModel()
  }

  retryAdd(widget: WidgetModel) {
    this.addWidget(widget)
  }

  confirmAdd() {
    let widget = new WidgetModel(0, this.adding.name, parseFloat(this.adding.price), this)
    this.adding = null
    this.widgets.unshift(widget)
    this.addWidget(widget)
  }

  private addWidget(widget: WidgetModel) {
    widget.start('add')
    this._service.add({name: widget.name, price: widget.price}).subscribe(
      r => {
        widget.success()
        widget.id = r.id
        setTimeout(() => {
          widget.end()
          setTimeout(() => {
            widget.clear()
          }, 250)
        }, 500)
      },
      e => {
        widget.error(e)
      })
  }

  abandonAdd(widget: WidgetModel) {
    let ix = this.widgets.indexOf(widget)
    this.widgets.splice(ix, 1)
  }

  cancelAdd() {
    this.adding = null
  }

  delete(widget: WidgetModel) {
    widget.start('delete')
    this._service.delete(widget.id).subscribe(
      () => {
        widget.success()
        setTimeout(() => {
          let ix = this.widgets.indexOf(widget)
          this.widgets.splice(ix, 1)
        }, 500)
      },
      e => {
        widget.error(e)
      })
  }

  startEdit(widget: WidgetModel, field: string) {
    this.editing = widget
    this.editingField = field
  }

  cancelEdit() {
    this.editing = null
    this.editingField = null
  }

  isEditing(widget: WidgetModel, field: string) {
    return this.editing == widget && this.editingField == field
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
