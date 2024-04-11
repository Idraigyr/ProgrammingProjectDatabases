import {World} from "./World.js";
import {Wizard} from "./Wizard.js";
import {Island} from "./Island.js";
import {Tree} from "./Buildings/Tree.js";
import {Altar} from "./Buildings/Altar.js";
import {Mine} from "./Buildings/Mine.js";
import {Tower} from "./Buildings/Tower.js";
import {FusionTable} from "./Buildings/FusionTable.js";
import {WarriorHut} from "./Buildings/WarriorHut.js";
import {Bush} from "./Buildings/Bush.js";
import {Watch} from "./Watch.js";
import {FollowPlayer, Immobile, MobileCollidable, Projectile, RitualSpell} from "./SpellEntities.js";

// Model namespace
export const Model = Object.freeze({
    World: World,
    Wizard: Wizard,
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
    Watch: Watch
});