import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ElevatorService from 'elevator/services/elevator';

interface ElevatorQueueArgs {}

export default class ElevatorQueue extends Component<ElevatorQueueArgs> {
  @service declare elevator: ElevatorService;

  get passengers() {
    const passenger =
      this.elevator.status === 'DROPPING-OFF'
        ? this.elevator.currentRequest
        : undefined;
    console.log('passenger', passenger);
    return passenger;
  }
}
