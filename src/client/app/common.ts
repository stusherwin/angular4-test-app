import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'
import { WidgetService } from './widget.service'

export interface IKeyed {
  key: string
}

export interface IReadOnly {
  isReadOnly: boolean
}

export class ReadOnlyService implements IReadOnly {
  private _isReadOnly = false

  get isReadOnly() { return (this._parent && this._parent.isReadOnly) || this._isReadOnly }

  constructor(private _parent?: ReadOnlyService) {
  }

  readOnly(propogate: boolean = true) {
    this._isReadOnly = true
    if(propogate && this._parent) {
      this._parent.readOnly()
    }
  }

  readWrite(propogate: boolean = true) {
    this._isReadOnly = false
    if(propogate && this._parent) {
      this._parent.readWrite()
    }
  }
}

export class EditService {
  private _currentlyEditingKey: string
  private _currentlyEditingSubject = new Subject<string>()
  
  startEdit(item: IKeyed) {
    console.log(item.key);
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
    this._currentlyEditingSubject.filter(k => k && k != item.key).subscribe(action)
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
    this._readOnlyService.readWrite()    
  }

  protected error(errorMessage: string) {
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
  }

  protected retry() {
    this.confirm()
  }

  protected abandon() {
    this.clear()
    this._abandon()
  }
}

export class AddModel extends ActionModel {
  constructor(
    key: string,
    editService: EditService,
    readOnlyService: ReadOnlyService,
    _confirm: () => Observable<any>,
    _done: () => void,
    _abandon: () => void,
  ) {
    super(key, editService, readOnlyService, _confirm, _done, _abandon)
  }

  protected error(errorMessage: string) {
    super.error(errorMessage)
    this._readOnlyService.readOnly(false)
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
      if(this.editing && !this.status) {
        this.cancel() 
      }
    })
  }

  start() {
    this.editing = true
    this._editService.startEdit(this)
  }

  cancel() {
    this.clear()
  }

  protected clear() {
    super.clear()
    this.editing = false
  }

  protected success() {
    super.success()
  }
}