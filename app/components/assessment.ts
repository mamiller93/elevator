import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ElevatorService from 'elevator/services/elevator';

interface AssessmentArgs {}

export default class Assessment extends Component<AssessmentArgs> {
  @service declare elevator: ElevatorService;

  @action
  handleKickoff() {
    this.elevator.addRequestDown(3, 2);
    setTimeout(
      () => this.elevator.addRequestDown(10, 1),
      this.elevator.millisecondsBetweenMovement
    );
  }

  countOfEaster = 0;

  @action
  triggerOnAlphaNumeric(e: KeyboardEvent) {
    if (/^a/.test(e.key)) {
      this.countOfEaster++;

      if (this.countOfEaster === 3) {
        this.handleKickoff();
        this.countOfEaster = 0;
      }
    } else {
      this.countOfEaster = 0;
    }
  }
}
