import {Player} from "./PlayerView.js";
import {Island} from "./IslandView.js";
import {Fireball, ThunderCloud, RitualSpell} from "./SpellView.js";
import {Mine} from "./Buildings/Mine.js";
import {Altar} from "./Buildings/Altar.js";
import {Tree} from  "./Buildings/Tree.js";
import {Shield} from "./Shield.js";
import {PreviewObject} from "./PreviewObject.js";
import {Bush} from "./Buildings/Bush.js";
import {FusionTable} from "./Buildings/FusionTable.js";

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
    Bush: Bush,
    FusionTable: FusionTable,
    Mine: Mine,
    Shield: Shield,
    PreviewObject: PreviewObject,
    RitualSpell: RitualSpell
}