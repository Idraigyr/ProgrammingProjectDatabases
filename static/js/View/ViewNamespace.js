import {Player} from "./PlayerView.js";
import {Island} from "./IslandView.js";
import {Fireball, ThunderCloud} from "./SpellView.js";
import {Mine} from "./Buildings/Mine.js";
import {Altar} from "./Buildings/Altar.js";
import {Tree} from  "./Buildings/Tree.js"

/**
 * Namespace for all the view classes
 */
export let View = {
    Player: Player,
    Island: Island,
    Fireball: Fireball,
    ThunderCloud: ThunderCloud,
    Tree: Tree,
    Altar: Altar,
    Mine: Mine
}