import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core'
import { ActionModel } from './common'

@Component({
  selector: 'status-indicator',
  templateUrl: './status-indicator.component.html',
  styleUrls: ['./status-indicator.component.less']
})
export class StatusIndicatorComponent {
  @Input()
  model: ActionModel

  @Input()
  retryIcon: string
}