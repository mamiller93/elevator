import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ElevatorService from 'elevator/services/elevator';

interface ElevatorArgs {}

export default class Elevator extends Component<ElevatorArgs> {
  @service declare elevator: ElevatorService;

  get floors() {
    return Array.from(
      { length: this.elevator.numberOfFloors },
      (_, i) => i + 1
    );
  }
}
