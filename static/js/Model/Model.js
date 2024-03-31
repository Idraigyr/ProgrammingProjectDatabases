import {World} from "./World.js";
import {Wizard} from "./Wizard.js";
import {Island} from "./Island.js";
import {Tree} from "./Buildings/Tree.js";
import {Altar} from "./Buildings/Altar.js";
import {Mine} from "./Buildings/Mine.js";
import {FusionTable} from "./Buildings/FusionTable.js";
import {Bush} from "./Buildings/Bush.js";
import {FollowPlayer, Immobile, MobileCollidable, Projectile, RitualSpell} from "./SpellEntities.js";

// Model namespace
export let Model = {
    World: World,
    Wizard: Wizard,
    Island: Island,
    Altar: Altar,
    Mine: Mine,
    Tree: Tree,
    FusionTable: FusionTable,
    Bush: Bush,
    Projectile: Projectile,
    Immobile: Immobile,
    MobileCollidable: MobileCollidable,
    FollowPlayer: FollowPlayer,
    RitualSpell: RitualSpell
}