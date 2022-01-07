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
  @tracked requestDirection = Directions.UP; // Default direction
  @tracked inMotion = false;

  @tracked requests: Array<CachedFloor> = new TrackedArray([]);
  @tracked upStops: { [key: number]: number } = {};
  @tracked downStops: { [key: number]: number } = {};

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
    return (
      Object.keys(this.upStops).length + Object.keys(this.downStops).length ===
      0
    );
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
      // Get the next direction to go based on request FIFO
      const nextRequest = this.requests[0];

      this.movementDirection =
        nextRequest.floor === this.currentFloor
          ? nextRequest.requestedFloor > this.currentFloor
            ? Directions.UP
            : Directions.DOWN
          : nextRequest.floor > this.currentFloor
          ? Directions.UP
          : Directions.DOWN;
      this.requestDirection = nextRequest.direction;

      this.move();
    }
  }

  private move() {
    if (this.isEmpty && this.hasEmptyRequests) {
      this.inMotion = false;
      return;
    }

    this.inMotion = true;

    const farthestFloorAway = this.getFarthestFloor();

    this.arrivedAtFloor(this.currentFloor);

    if (!farthestFloorAway || farthestFloorAway === this.currentFloor) {
      setTimeout(() => this.move(), this.millisecondsBetweenMovement);
    } else {
      // Set new floor, with boundary conditions
      this.currentFloor = Math.min(
        Math.max(
          1,
          this.currentFloor +
            (this.movementDirection === Directions.UP ? 1 : -1)
        ),
        this.numberOfFloors
      );
    }

    setTimeout(() => this.move(), this.millisecondsBetweenMovement);
  }

  private getFarthestFloor(): number | undefined {
    let floor = undefined;

    // if we have passengers, we know the direction
    if (!this.isEmpty) {
      const map =
        this.movementDirection === Directions.UP
          ? this.upStops
          : this.downStops;

      for (const key in map) {
        const int = parseInt(key);
        if (this.movementDirection === Directions.UP) {
          floor = floor && floor > int ? floor : int;
        } else {
          floor = floor && floor < int ? floor : int;
        }
      }
    } else {
      const obj = this.requests.reduce((prev, current) => {
        if (this.movementDirection === Directions.UP) {
          return prev.floor > current.floor ? prev : current;
        } else {
          return prev.floor < current.floor ? prev : current;
        }
      });
      // If we're already on the floor picking up passengers, switch to the requested floor
      floor = this.currentFloor === obj.floor ? obj.requestedFloor : obj.floor;
    }

    if (!floor) {
      this.movementDirection =
        this.movementDirection === Directions.UP
          ? Directions.DOWN
          : Directions.UP;
      floor = this.getFarthestFloor();
    }

    return floor;
  }

  private arrivedAtFloor(floor: number) {
    // first let all of the passengers on the elevator depart
    delete this.upStops[floor];
    delete this.downStops[floor];

    // grab any passengers waiting on this floor
    const passengersAboarding: Array<CachedFloor> = [];
    for (let i = 0; i < this.requests.length; i++) {
      const request = this.requests[i];
      if (
        request.direction === this.requestDirection &&
        request.floor === floor
      ) {
        this.requests.removeAt(i, 1);
        passengersAboarding.push(request);
      }
    }
    // eslint-disable-next-line no-self-assign
    this.requests = this.requests;

    // increment the upStops
    passengersAboarding.forEach((passenger) => {
      if (this.requestDirection === Directions.UP) {
        this.incrementMap(this.upStops, passenger.requestedFloor);
      } else {
        this.incrementMap(this.downStops, passenger.requestedFloor);
      }
    });

    // check for any new passengers that chose the same floor since we're already here
    delete this.upStops[floor];
    delete this.downStops[floor];

    // eslint-disable-next-line no-self-assign
    this.upStops = this.upStops;
    // eslint-disable-next-line no-self-assign
    this.downStops = this.downStops;
  }

  private incrementMap(map: any, key: number) {
    const val = map[key] === undefined ? 1 : map[key] + 1;
    map[key] = val;

    // eslint-disable-next-line no-self-assign
    map = map;
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
