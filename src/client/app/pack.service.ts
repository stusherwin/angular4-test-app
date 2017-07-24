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
  packId: number
  widgetId: number
  quantity: number
}

export class ApiRemoveWidgetRequest {
  packId: number
  widgetId: number
}

export class ApiUpdateWidgetRequest {
  packId: number
  widgetId: number
  quantity: number
}

export class ApiAddPackRequest {
  name: string
  price: number
}

export class ApiAddPackResponse {
  id: number
}

export class ApiWidget {
  id: number
  name: string
  quantity: number
}

export class ApiPack {
  id: number
  name: string
  price: number
  widgets: ApiWidget[]
}

export class ApiUpdatePackRequest {
  id: number
  property: string
  value: any
}

export class PackService {
  fail = false

  private _packs: ApiPack[] = [
    {id: 1, name: 'Left-handed pack', price: 14.99, widgets: [
    ]},
    {id: 2, name: 'Right-handed pack', price: 13.99, widgets: [
      {id: 1, name: 'Left-handed widget', quantity: 1},
      {id: 2, name: 'Right-handed widget', quantity: 3},
      {id: 3, name: 'Screw confobulator', quantity: 2}
    ]},
    {id: 3, name: 'Screw confobulator', price: 23.50, widgets: [
      {id: 1, name: 'Left-handed widget', quantity: 1},
      {id: 3, name: 'Screw confobulator', quantity: 2}
    ]}
  ]

  private _widgets: any[] = [
    {id: 1, name: 'Left-handed widget'},
    {id: 2, name: 'Right-handed widget'},
    {id: 3, name: 'Screw confobulator'}
  ]

  all(): Observable<ApiPack[]> {
    return Observable.of(this._packs).delay(1)//3000);
  }

  add(request: ApiAddPackRequest): Observable<ApiAddPackResponse> {
    if(!this.fail) {
      this.fail = true
      let newPack = {
        id: this._packs.reduce((max, w) => Math.max(max, w.id), 0) + 1,
        name: request.name,
        price: request.price,
        widgets: []
      }
      this._packs.push(newPack)

      return Observable.of(newPack).delay(1)//3000)
    }

    this.fail = false
    return Observable.throw('Could not add this pack').materialize().delay(3000).dematerialize()
  }

  delete(id: number): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._packs.findIndex(w => w.id == id)
      this._packs.splice(i, 1)
      
      return Observable.of(null).delay(1)//3000)
    }

    this.fail = false
    return Observable.throw('Could not delete this pack').materialize().delay(3000).dematerialize()
  }

  update(request: ApiUpdatePackRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._packs.findIndex(w => w.id == request.id)
      this._packs[i][request.property] = request.value
      
      return Observable.of(null).delay(1)//3000)
    }

    this.fail = false
    return Observable.throw('Could not update this pack').materialize().delay(3000).dematerialize()
  }

  addWidget(request: ApiAddWidgetRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let pack = this._packs.find(p => p.id == request.packId)
      let widgetName = this._widgets.find(w => w.id == request.widgetId).name
      pack.widgets.push({id: request.widgetId, name: widgetName, quantity: request.quantity})

      return Observable.of(null).delay(1)//3000)
    }

    this.fail = false
    return Observable.throw('Could not add this widget').materialize().delay(3000).dematerialize()
  }

  removeWidget(request: ApiRemoveWidgetRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let pack = this._packs.find(p => p.id == request.packId)

      let i = pack.widgets.findIndex(w => w.id == request.widgetId)
      pack.widgets.splice(i, 1)
      
      return Observable.of(null).delay(1)//3000)
    }

    this.fail = false
    return Observable.throw('Could not remove this widget').materialize().delay(3000).dematerialize()
  }

  updateWidget(request: ApiUpdateWidgetRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let pack = this._packs.find(p => p.id == request.packId)
      let widget = pack.widgets.find(w => w.id == request.widgetId)
      widget.quantity = request.quantity
      
      return Observable.of(null).delay(1)//3000)
    }
      
    this.fail = false
    return Observable.throw('Could not update this widget').materialize().delay(3000).dematerialize()
  }
}