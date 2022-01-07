import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ElevatorService, { Directions } from 'elevator/services/elevator';

interface ElevatorQueueArgs {}

export default class ElevatorQueue extends Component<ElevatorQueueArgs> {
  @service declare elevator: ElevatorService;

  get passengers() {
    const floors =
      this.elevator.movementDirection === Directions.UP
        ? this.elevator.upStops
        : this.elevator.downStops;
    console.log('fllors', floors);
    return floors;
  }
}
