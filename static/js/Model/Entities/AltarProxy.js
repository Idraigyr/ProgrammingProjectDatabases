import {Entity} from "./Entity";

export class AltarProxy extends Entity{
    constructor(params) {
        super(params);
        this.health = params?.health ?? 100;
        this.maxHealth = params?.maxHealth ?? 100;
    }
}