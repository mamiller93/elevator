import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Service, { inject as service } from '@ember/service';

import BuildingService from 'elevator/services/building';
import { TrackedArray } from 'tracked-built-ins';

type CachedFloor = {
  floor: number;
  direction: Directions;
  requestedFloor: number;
};

export default class ElevatorService extends Service {
  @service declare building: BuildingService;

  @tracked numberOfFloors = 0;
  @tracked currentFloor = 1; // Default first floor
  @tracked movementDirection = Directions.UP; // Default direction
  @tracked status: 'PICKING-UP' | 'DROPPING-OFF' | undefined = undefined;
  @tracked inMotion = false;
  @tracked requests: Array<CachedFloor> = new TrackedArray([]);
  @tracked currentRequest: CachedFloor | undefined = undefined;

  maximumNumberOfPeople = 100;
  millisecondsBetweenMovement = 1000;

  constructor() {
    super(...arguments);

    this.numberOfFloors = this.building.numberOfFloors; // elevator goes to the entire building
    this.moveWrapper();
  }

  get hasEmptyRequests() {
    return this.requests.length === 0;
  }

  get isEmpty() {
    return this.currentRequest === undefined;
  }

  @action
  addRequestUp(floor: number, requestedFloor: number) {
    this.addRequest(floor, Directions.UP, requestedFloor);
  }

  @action
  addRequestDown(floor: number, requestedFloor: number) {
    this.addRequest(floor, Directions.DOWN, requestedFloor);
  }

  private addRequest(
    floor: number,
    direction: Directions,
    requestedFloor: number
  ) {
    if (requestedFloor <= this.numberOfFloors && requestedFloor > 0) {
      this.requests.push({ floor, direction, requestedFloor });

      this.moveWrapper();
    }
  }

  private moveWrapper() {
    if (this.isEmpty && this.hasEmptyRequests) {
      return;
    }

    // Decide which direction to move, if not yet in motion
    if (!this.inMotion) {
      this.move();
    }
  }

  private move() {
    if (this.isEmpty && this.hasEmptyRequests) {
      this.inMotion = false;
      return;
    }

    this.inMotion = true;

    // Do we currently have a request or do we need a new one?
    this.currentRequest = this.currentRequest ?? this.requests[0]!;

    if (this.status === undefined || this.status === 'PICKING-UP') {
      if (this.isOnCorrectFloor(this.currentRequest?.floor)) {
        this.movementDirection = this.getMovementDirection(
          this.currentFloor,
          this.currentRequest.requestedFloor
        );

        this.requests.shift();

        // pick up passenger here and switch status
        this.status = 'DROPPING-OFF';
      } else {
        this.movementDirection = this.getMovementDirection(
          this.currentFloor,
          this.currentRequest.floor
        );
        this.currentFloor = this.moveOneSpace();
      }
    } else if (this.status === 'DROPPING-OFF') {
      if (this.isOnCorrectFloor(this.currentRequest?.requestedFloor)) {
        //release the hounds
        this.currentRequest = undefined;

        this.status = 'PICKING-UP';
      } else {
        this.movementDirection = this.getMovementDirection(
          this.currentFloor,
          this.currentRequest.requestedFloor
        );

        this.currentFloor = this.moveOneSpace();
      }
    }

    setTimeout(() => this.move(), this.millisecondsBetweenMovement);
  }

  getMovementDirection(currentFloor: number, desiredFloor: number): Directions {
    return currentFloor > desiredFloor ? Directions.DOWN : Directions.UP;
  }

  isOnCorrectFloor(desiredFloor: number): boolean {
    return this.currentFloor === desiredFloor;
  }

  moveOneSpace() {
    return (
      this.currentFloor + (this.movementDirection === Directions.UP ? 1 : -1)
    );
  }
}

export enum Directions {
  UP = 'UP',
  DOWN = 'DOWN',
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    elevator: ElevatorService;
  }
}
