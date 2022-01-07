import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ElevatorService from 'elevator/services/elevator';

interface FloorQueueArgs {}

export default class FloorQueue extends Component<FloorQueueArgs> {
  @service declare elevator: ElevatorService;

  get floorRequests() {
    return this.elevator.requests;
  }
}
