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