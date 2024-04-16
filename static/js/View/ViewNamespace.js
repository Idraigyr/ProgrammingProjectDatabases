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
import {Minion} from "./Characters/Minion.js";
import {Watch} from "./Watch.js";
import {Bridge} from "../Model/Bridge.js";

/**
 * View namespace
 * @type {Readonly<{BuildingPreview: BuildingPreview, Player: Player, FusionTable: FusionTable, Shield: Shield, WarriorHut: WarriorHut, Island: Island, ThunderCloud: ThunderCloud, Fireball: Fireball, Minion: Minion, Bush: Bush, Mine: Mine, Watch: Watch, Tree: Tree, Tower: Tower, IceWall: ((function(*): *[])|*), Altar: Altar, Bridge: Bridge, SpellPreview: SpellPreview, RitualSpell: RitualSpell}>}
 */
export const View = Object.freeze({
    Player: Player,
    Minion: Minion,
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
    Watch: Watch,
    Bridge: Bridge
});