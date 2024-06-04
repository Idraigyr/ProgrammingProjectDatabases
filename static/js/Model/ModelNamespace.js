import {World} from "./World.js";
import {Wizard} from "./Entities/Characters/Wizard.js";
import {Island} from "./Entities/Foundations/Island.js";
import {Tree} from "./Entities/Buildings/Tree.js";
import {Altar} from "./Entities/Buildings/Altar.js";
import {Mine} from "./Entities/Buildings/Mine.js";
import {Tower} from "./Entities/Buildings/Tower.js";
import {FusionTable} from "./Entities/Buildings/FusionTable.js";
import {WarriorHut} from "./Entities/Buildings/WarriorHut.js";
import {Bush} from "./Entities/Buildings/Bush.js";
import {Watch} from "./Watch.js";
import {FollowPlayer, Immobile, MobileCollidable, Projectile, RitualSpell} from "./Entities/SpellEntities.js";
import {Minion} from "./Entities/Characters/Minion.js";
import {Bridge} from "./Entities/Foundations/Bridge.js";
import {Wall} from "./Entities/Buildings/Wall.js";
import {Character} from "./Entities/Characters/Character.js";
import {AltarProxy} from "./Entities/Proxys/AltarProxy.js";
import {TowerProxy} from "./Entities/Proxys/TowerProxy.js";


/**
 * Model namespace
 * @type {Readonly<{Character: Character, Immobile: Immobile, FusionTable: FusionTable, WarriorHut: WarriorHut, World: World, Island: Island, Projectile: Projectile, FollowPlayer: FollowPlayer, Minion: Minion, Mine: Mine, Bush: Bush, MobileCollidable: MobileCollidable, Watch: Watch, Tree: Tree, Tower: Tower, Altar: Altar, Wizard: Wizard, Bridge: Bridge, RitualSpell: RitualSpell}>}
 */
export const Model = Object.freeze({
    World: World,
    Character: Character,
    Wizard: Wizard,
    Minion: Minion,
    Island: Island,
    Altar: Altar,
    Mine: Mine,
    Tower: Tower,
    Tree: Tree,
    FusionTable: FusionTable,
    WarriorHut: WarriorHut,
    Bush: Bush,
    Projectile: Projectile,
    Immobile: Immobile,
    MobileCollidable: MobileCollidable,
    FollowPlayer: FollowPlayer,
    RitualSpell: RitualSpell,
    Watch: Watch,
    Bridge: Bridge,
    Wall: Wall,
    AltarProxy: AltarProxy,
    TowerProxy: TowerProxy
});