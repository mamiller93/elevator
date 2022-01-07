import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ElevatorService from 'elevator/services/elevator';

interface ElevatorButtonsArgs {}

export default class ElevatorButtons extends Component<ElevatorButtonsArgs> {
  @service declare elevator: ElevatorService;

  @tracked requestedFloor: string | undefined = undefined;

  get floors() {
    return Array.from(
      { length: this.elevator.numberOfFloors },
      (_, i) => i + 1
    );
  }

  @action
  handleUp(floor: number) {
    if (this.requestedFloor) {
      const int = parseInt(this.requestedFloor);
      this.elevator.addRequestUp(floor, int);
      this.requestedFloor = undefined;
    }
  }

  @action
  handleDown(floor: number) {
    if (this.requestedFloor) {
      const int = parseInt(this.requestedFloor);
      this.elevator.addRequestDown(floor, int);
      this.requestedFloor = undefined;
    }
  }
}
