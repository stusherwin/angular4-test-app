import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/throw'  
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/materialize'
import 'rxjs/add/operator/dematerialize'


@Component({
  selector: 'status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.less']
})
export class StatusIndicatorComponent {
  @Input()
  status: string

  @Input()
  errorMessage: string

  @Input()
  actionName: string

  @Input()
  retryIcon: string

  @Output()
  retry = new EventEmitter<void>()

  @Output()
  cancel = new EventEmitter<void>()
}