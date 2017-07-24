import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ElementRef, ViewChildren, QueryList, Renderer, OnDestroy } from '@angular/core'
import { EditModel, EditService, ReadOnlyService } from './common'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription'
import { NgForm } from '@angular/forms'

export class TextEditModel extends EditModel {
  submitted = false
  editingValue: string

  get potentialValue(): string {
    return this.editingValue
  }

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
    this.submitted = false
  }
}

@Component({
  selector: 'editable-text',
  templateUrl: './editable-text.component.html',
})
export class EditableTextComponent implements AfterViewChecked, AfterViewInit, OnDestroy {
  @Input()
  model: TextEditModel

  @Input()
  required: boolean

  @Input()
  valueName = 'Value'

  @ViewChild('ngForm')
  ngForm: NgForm

  @ViewChildren('input')
  input: QueryList<ElementRef>

  validationErrors: string = ''

  errorMessages: {[key: string]: string} = {
    required: '$VALUE must not be empty.'
  }

  controlNames = ['value']
  formValueChangesSub: Subscription = null
  inputChangesSub: Subscription = null
  
  constructor(public renderer: Renderer) {
  }

  ngAfterViewInit() {
    this.inputChangesSub = this.input.changes.subscribe((i: QueryList<ElementRef>) => {
      if(i.length) {
        this.renderer.invokeElementMethod(i.first.nativeElement, 'focus', []);
      }
    })
  }

  ngAfterViewChecked() {
    if(!this.ngForm) {
      if(this.formValueChangesSub) {
        this.formValueChangesSub.unsubscribe()
      }

      return;
    }

    let form = this.ngForm;
    this.ngForm.valueChanges
      .subscribe(data => {
        this.validationErrors = ''

        if(form.valid) {
          return;
        }

        for(const name of this.controlNames) {
          for(const error in form.controls[name].errors) {
            if(this.validationErrors.length) {
              this.validationErrors += '\n'
            }
            this.validationErrors += this.errorMessages[error].replace('$VALUE', this.valueName);
          }
        }
      });
  }

  ngOnDestroy() {
    if(this.formValueChangesSub) {
      this.formValueChangesSub.unsubscribe()
    }
   
    if(this.inputChangesSub) {
      this.inputChangesSub.unsubscribe()
    }
  }

  onSubmit() {
    this.model.submitted = true

    if(this.ngForm.form.valid) {
      this.model.confirm()
    }
  }

  onChange() {
    if(this.model.isError) {
      this.model.status = null;
    }
  }
}