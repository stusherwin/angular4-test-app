import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'  
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/dematerialize'
import 'rxjs/add/operator/do'
import 'rxjs/add/operator/filter'

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

export class ApiUpdateWidgetRequest {
  id: number
  property: string
  value: any
}

export class WidgetService {
  fail = false

  private _widgets: ApiWidget[] = [
    {id: 1, name: 'Left-handed widget', price: 14.99},
    {id: 2, name: 'Right-handed widget', price: 13.99},
    {id: 3, name: 'Screw confobulator', price: 23.50}
  ]

  all(): Observable<ApiWidget[]> {
    return Observable.of(this._widgets).delay(3000);
  }

  add(request: ApiAddWidgetRequest): Observable<ApiAddWidgetResponse> {
    if(!this.fail) {
      this.fail = true
      let newWidget = {
        id: this._widgets.reduce((max, w) => Math.max(max, w.id), 0) + 1,
        name: request.name,
        price: request.price
      }
      this._widgets.push(newWidget)

      return Observable.of(newWidget).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not add this widget').materialize().delay(3000).dematerialize()
  }

  delete(id: number): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._widgets.findIndex(w => w.id == id)
      this._widgets.splice(i, 1)
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not delete this widget').materialize().delay(3000).dematerialize()
  }

  update(request: ApiUpdateWidgetRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._widgets.findIndex(w => w.id == request.id)
      this._widgets[i][request.property] = request.value
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not update this widget').materialize().delay(3000).dematerialize()
  }
}