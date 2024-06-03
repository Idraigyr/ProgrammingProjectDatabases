import {Placeable} from "./Placeable.js";

/**
 * Class for the wall model
 */
export class Wall extends Placeable {
  constructor(params) {
    super(params);
    this.timeToBuild = 10;
  }

      /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "wall_building";
    }
}