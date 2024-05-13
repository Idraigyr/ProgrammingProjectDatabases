import {Character} from "./Character.js";

/**
 * @class Wizard - class for the player character
 */
export class Wizard extends Character{
    constructor(params) {
        super(params);
        this.spells = [null,null,null,null,null];
        this.spellCooldowns = [0,0,0,0,0];
        this.currentSpell = 0;
        this.maxMana = params?.maxMana ?? 100;
        this.mana = params?.mana ?? this.maxMana;
        this.id = params?.id ?? null;
        this.shields = 0;
    }

    setId(data) {
        this.id = data.entity.player_id;
    }

    /**
     * Change the equipped spell
     * @param index - index of the spell slot to equip
     * @param newSpell - new spell to equip
     * @param onCooldown - if the spell should be on cooldown when equipped
     */
    changeEquippedSpell(index, newSpell, onCooldown = false){
        this.spells.splice(index,1,newSpell);
        this.spellCooldowns.splice(index,1,onCooldown ? newSpell.getCooldown() : 0);
    }

    /**
     * Update the cooldowns of the equipped spells
     * @param deltaTime - time since last update
     */
    updateCooldowns(deltaTime){
        this.spellCooldowns.forEach((cooldown, index, array) => {
            array[index] = Math.max(0,cooldown -= deltaTime);
        });
        //notify the hud to update the cooldowns of the spells
        this.dispatchEvent(this.#createUpdateCooldownsEvent());
    }

    /**
     * Update cooldown of the current spell
     */
    cooldownSpell(){
        this.spellCooldowns[this.currentSpell] = this.spells[this.currentSpell].getCooldown();
        this.mana -= this.spells[this.currentSpell].cost;
        this.dispatchEvent(this.#createUpdateManaEvent());
    }

    /**
     * Get the current spell cooldown
     * @returns {number|number} - the current spell cooldown
     */
    get currentSpellCooldown(){
        return this.getCurrentSpell() ? this.spellCooldowns[this.currentSpell] :  -1;
    }

    /**
     * Get the current spell
     * @returns current spell
     */
    getCurrentSpell(){
        return this.spells[this.currentSpell];
    }

    /**
     * Return if the player can cast the current spell
     * @returns {boolean|boolean} - if the player can cast the current spell
     */
    canCast(){
        return (this.getCurrentSpell() ? (this.spellCooldowns[this.currentSpell] === 0 && this.mana >= this.getCurrentSpell().cost) : false);
    }

    /**
     * refill the mana of the player
     * @param {Number} amount - amount of mana to refill
     */
    changeCurrentMana(amount){
        this.mana = amount > 0 ? Math.min(this.maxMana, this.mana + amount) : Math.max(0, this.mana + amount);
        this.dispatchEvent(this.#createUpdateManaEvent());
    }

    /**
     * refill the health of the player
     * @param {Number} amount - amount of health to refill
     */
    changeCurrentHealth(amount){
        this.health = amount > 0 ? Math.min(this.maxHealth, this.health + amount) : Math.max(0, this.health + amount);
        this.dispatchEvent(this.#createUpdateHealthEvent());
    }

    updateMaxManaAndHealth(event){
        this.mana = event.detail.maxMana;
        this.maxMana = event.detail.maxMana;
        this.health = event.detail.maxHealth;
        this.maxHealth = event.detail.maxHealth;
        this.advertiseCurrentCondition();
    }

    /**
     * Increase the maximum mana of the player
     * @param {Number} amount - amount to increase the maximum mana by, needs to be bigger than 0
     */
    increaseMaxMana(amount){
        this.maxMana += amount;
        //this.mana += amount;
    }

    /**
     * Increase the maximum health of the player
     * @param {Number} amount - amount to increase the maximum health by, needs to be bigger than 0
     */
    increaseMaxHealth(amount){
        this.maxHealth += amount;
        //this.health += amount;
    }

    /**
     * changes spellCooldown
     * @param spellName
     * @param coolDown
     */
    changeSpellCoolDown(spellName, coolDown){
        let index = 0;
        for(let spell of this.spells){
            if(spell.name === spellName){
                spell.spell.cooldown = coolDown;
                this.spellCooldowns[index] = coolDown;
            }
            index++;
        }
    }

    /**
     * sets cost of all spells to 0
     */
    changeSpellCost() {
        for(let spell of this.spells){
            spell.cost = 0;
        }
    }

    /**
     * Notify observers of the current condition of the player
     */
    advertiseCurrentCondition(){
        this.dispatchEvent(this.#createUpdateManaEvent());
        this.dispatchEvent(this.#createUpdateHealthEvent());
    }


    /**
     * Get the type of the entity
     * @returns {string} - the type of the entity
     */
    get type(){
        return "player";
    }

    /**
     * Create a custom event to update the mana of the player
     * @returns {CustomEvent<{current: (*|number|RegExp|number), total: (*|number|number)}>} - the custom event
     */
    #createUpdateManaEvent() {
        return new CustomEvent("updateMana", {detail: {current: this.mana, total: this.maxMana}});
    }

    /**
     * Create a custom event to update the health of the player
     * @returns {CustomEvent<{current: (*|number|RegExp), total: (*|number|RegExp)}>} - the custom event
     */
    #createUpdateHealthEvent() {
        return new CustomEvent("updateHealth", {detail: {current: this.health, total: this.maxHealth}});
    }

    /**
     * Create a custom event to update the cooldowns of the players spells
     * @returns {CustomEvent<{detail: cooldown: list}>} - the custom event
     */
    #createUpdateCooldownsEvent() {
        return new CustomEvent("updateCooldowns", {detail: {cooldowns: this.spellCooldowns}});
    }

    /**
     * resets the shields of the player to 0 (used when shield spell runs out)
     */

    resetShields(){
        this.shields = 0;
    }

    /**
     * Function to handle damage to the player
     * @param damage - amount of damage to take
     */

    takeDamage(damage){
        if(damage <= 0) return;
        if (this.shields > 0){
            this.shields -= 1;
            this.dispatchEvent(new CustomEvent("shieldLost", {detail: {shields: this.shields}}));
            return;
        }
        const prevHealth = this.health;
        this.health -= damage;
        this.dispatchEvent(this.createHealthUpdateEvent(prevHealth));
        if(this.health <= 0){
            this.health = 0;
            this.dies();
        }
    }

    /**
     * Function that gets called when the player dies
     */
    dies() {
        console.log("Player died")
        this.dispatchEvent(new CustomEvent("playerDied"));

    }

    /**
     * Function that gets called when the player respawns
     * @param {THREE.Vector3} position - position to respawn at
     * @param {boolean} refillHealth - if the health should be refilled
     * @param {boolean} refillMana - if the mana should be refilled
     */
    respawn(position = null, refillHealth = true, refillMana = true) {
        this.position = this._position.copy(position ?? this.spawnPoint);
        if(refillHealth) this.changeCurrentHealth(this.maxHealth);
        if(refillMana) this.changeCurrentMana(this.maxMana);
    }




}