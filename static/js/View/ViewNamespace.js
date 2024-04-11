import {Player} from "./PlayerView.js";
import {Island} from "./IslandView.js";
import {Fireball, ThunderCloud, RitualSpell, IceWall} from "./SpellView.js";
import {Mine} from "./Buildings/Mine.js";
import {Altar} from "./Buildings/Altar.js";
import {Tree} from  "./Buildings/Tree.js";
import {Shield} from "./Shield.js";
import {SpellPreview} from "./SpellPreview.js";
import {Tower} from "./Buildings/Tower.js";
import {Bush} from "./Buildings/Bush.js";
import {FusionTable} from "./Buildings/FusionTable.js";
import {WarriorHut} from "./Buildings/WarriorHut.js";
import {BuildingPreview} from "./BuildingPreview.js";
import {Watch} from "./Watch.js";

/**
 * Namespace for all the view classes
 */
export const View = Object.freeze({
    Player: Player,
    Island: Island,
    Fireball: Fireball,
    ThunderCloud: ThunderCloud,
    Tree: Tree,
    Altar: Altar,
    Bush: Bush,
    FusionTable: FusionTable,
    WarriorHut: WarriorHut,
    Mine: Mine,
    Tower: Tower,
    Shield: Shield,
    IceWall: IceWall,
    SpellPreview: SpellPreview,
    BuildingPreview: BuildingPreview,
    RitualSpell: RitualSpell,
    Watch: Watch
});