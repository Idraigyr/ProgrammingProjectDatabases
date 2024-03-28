import {World} from "./World.js";
import {Wizard} from "./Wizard.js";
import {Island} from "./Island.js";
import {Tree} from "./Buildings/Tree.js";
import {Altar} from "./Buildings/Altar.js";
import {Mine} from "./Buildings/Mine.js";
import {FollowPlayer, Immobile, Projectile} from "./SpellEntities.js";
import {Tower} from "./Buildings/Tower.js";

// Model namespace
export let Model = {
    World: World,
    Wizard: Wizard,
    Island: Island,
    Altar: Altar,
    Mine: Mine,
    Tower: Tower,
    Tree: Tree,
    Projectile: Projectile,
    Immobile: Immobile,
    FollowPlayer: FollowPlayer
}