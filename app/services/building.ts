import Service from '@ember/service';

export default class BuildingService extends Service {
  numberOfFloors = 10;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    building: BuildingService;
  }
}
