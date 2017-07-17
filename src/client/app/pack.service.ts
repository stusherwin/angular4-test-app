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

export class ApiAddPackRequest {
  name: string
  price: number
}

export class ApiAddPackResponse {
  id: number
}

export class ApiPack {
  id: number
  name: string
  price: number
}

export class ApiUpdatePackRequest {
  id: number
  property: string
  value: any
}

export class PackService {
  fail = false

  private _packs: ApiPack[] = [
    {id: 1, name: 'Left-handed pack', price: 14.99},
    {id: 2, name: 'Right-handed pack', price: 13.99},
    {id: 3, name: 'Screw confobulator', price: 23.50}
  ]

  all(): Observable<ApiPack[]> {
    return Observable.of(this._packs).delay(3000);
  }

  add(request: ApiAddPackRequest): Observable<ApiAddPackResponse> {
    if(!this.fail) {
      this.fail = true
      let newPack = {
        id: this._packs.reduce((max, w) => Math.max(max, w.id), 0) + 1,
        name: request.name,
        price: request.price
      }
      this._packs.push(newPack)

      return Observable.of(newPack).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not add this pack').materialize().delay(3000).dematerialize()
  }

  delete(id: number): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._packs.findIndex(w => w.id == id)
      this._packs.splice(i, 1)
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not delete this pack').materialize().delay(3000).dematerialize()
  }

  update(request: ApiUpdatePackRequest): Observable<void> {
    if(!this.fail) {
      this.fail = true
      let i = this._packs.findIndex(w => w.id == request.id)
      this._packs[i][request.property] = request.value
      
      return Observable.of(null).delay(3000)
    }

    this.fail = false
    return Observable.throw('Could not update this pack').materialize().delay(3000).dematerialize()
  }
}