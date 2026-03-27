import {
  Player,
  Replayer,
  Ground,
  Wall,
  Portal,
  Button,
  Spike,
  Platform,
  TextPrompt,
  KeyPrompt,
  GameEntity,
} from "../game-entity-model/index.js";
import { ColliderType } from "../collision-system/enumerator.js";
import { CollisionSystem } from "../collision-system/CollisionSystem.js";
import { PhysicsSystem } from "../physics-system/PhysicsSystem.js";
import { RecordSystem } from "../record-system/RecordSystem.js";
import { BaseLevel } from "./BaseLevel.js";
import { Assets } from "../AssetsManager.js";
import { Room } from "./Room.js";
import { EventTypes } from "../event-system/EventTypes.js";
import { KeyBindingManager } from "../key-binding-system/KeyBindingManager.js";
import { keyCodeToLabel } from "../record-system/RecordKeyUtil.js";
import { isGamePaused } from "../game-runtime/GamePauseState.js";
import { t } from "../i18n.js";

const WALL_THICKNESS = 20;
const PLAYER_SIZE = 40;
const BOMB_TIMER_MS = 7500;
const BOMB_RADIUS = 128;
const BOMB_SIZE = 20;
const REPLAY_BOMB_COOLDOWN_MS = 220;
const TURRET_LOCK_TIME_MS = 650;
import { Player, Bomb, Turret } from "../../game-entity-model/index.js";
import { CollisionSystem } from "../../collision-system/CollisionSystem.js";
import { PhysicsSystem } from "../../physics-system/PhysicsSystem.js";
import { RecordSystem } from "../../record-system/RecordSystem.js";
import { BaseLevel } from "../BaseLevel.js";
import { Assets } from "../../AssetsManager.js";
import { Room } from "../Room.js";

export class Level8 extends BaseLevel {
  constructor(p, eventBus) {
    super(p, eventBus);

    this._activeRoomIndex = 0;
    this._replayer = null;
    this._transition = null;
    this._transitionDurationMs = 260;

    this._keyBindingManager = KeyBindingManager.getInstance();

    this._bombCount = 0;
    this._activeBombs = [];
    this._activeEffects = [];
    this._bombDeployCooldownUntilMs = 0;

    this._chestSpawned = false;
    this._chestOpened = false;
    this._chestSpawnIndex = Math.random() < 0.5 ? 0 : 1;

    this._rockDestroyed = false;
    this._turretDestroyed = false;
    this._exitUnlocked = false;
    this._turretLockElapsedMs = 0;

    this._noticeKey = "";
    this._noticeUntilMs = 0;

    this.rooms = this._buildRooms(p);
    this._applyWorldOffsetsToRooms(p);

    this._player = new Player(80, 80, PLAYER_SIZE, PLAYER_SIZE);
    this._player.createListeners();

    this.entities = this._buildEntities();

    this.recordSystem = new RecordSystem(
      this._player,
      5000,
      (x, y) => this.addReplayer(x, y),
      () => this.removeReplayer(),
      {
        onReplayStart: () => {
          this._turretLockElapsedMs = 0;
        },
      },
    );
    this.recordSystem.createListeners();

    this.physicsSystem = new PhysicsSystem(this.entities);
    this.collisionSystem = new CollisionSystem(this.entities, eventBus);

    this._setStaticEntityGone(this._rockBlocker, false);

    this._onLevelKeyDown = (event) => this._handleLevelKeyDown(event);
    document.addEventListener("keydown", this._onLevelKeyDown);
  }

  _buildRooms(p) {
    const interactionLabel = keyCodeToLabel(
      this._keyBindingManager.getKeyByIntent("interaction"),
    );

    this._startBeacon = new Level8SpawnBeacon(36, 80, 56, 74);

    this._room0ButtonGround = new Button(150, 80, 34, 10, {
      color: { unpressed: [255, 90, 120], pressed: [182, 48, 74] },
    });
    this._room0ButtonUpper = new Button(488, 240, 34, 10, {
      color: { unpressed: [255, 90, 120], pressed: [182, 48, 74] },
    });

    this._room0Chest = new Level8Chest(220, 92, 40, 30);
    if (this._chestSpawnIndex === 1) {
      this._room0Chest.x = 540;
      this._room0Chest.y = 252;
    }

    this._room0ChestPrompt = new KeyPrompt(
      this._room0Chest.x + 4,
      this._room0Chest.y + 42,
      this,
      {
        keys: [{ col: 0, row: 0, label: interactionLabel }],
      },
    );
    this._room0ChestPrompt._showDistance = 86;
    this._room0ChestPrompt._hideDistance = 150;
    this._room0ChestPrompt._hidden = true;

    this._room0IntroPrompt = new TextPrompt(72, 330, this, {
      textKey: "level8_room0_prompt",
      textSize: 20,
      width: 440,
      height: 120,
      visibilityFn: () => !this._chestOpened,
    });

    const room0 = new Room(
      [
        new Wall(0, 0, WALL_THICKNESS, p.height),
        new Ground(0, 0, p.width, 80),
        this._startBeacon,
        new Platform(250, 140, 120, 20),
        new Platform(420, 220, 180, 20),
        new Platform(590, 300, 90, 20),
        this._room0ButtonGround,
        this._room0ButtonUpper,
        this._room0Chest,
        this._room0ChestPrompt,
        this._room0IntroPrompt,
      ],
      { right: { targetRoomIndex: 1 } },
    );

    this._room1RockHint = new TextPrompt(648, 330, this, {
      textKey: "level8_room1_prompt",
      textSize: 18,
      width: 420,
      height: 120,
      visibilityFn: () => this._chestOpened && !this._rockDestroyed,
    });

    this._room1RockVisual = new Level8RockPile(840, 80, 180, 220);
    this._rockBlocker = new Platform(880, 80, 110, 220);

    const room1 = new Room(
      [
        new Ground(0, 0, p.width, 80),
        new Spike(320, 80, 240, 20, { color: [180, 185, 205] }),
        new Platform(350, 160, 110, 20),
        new Platform(530, 240, 110, 20),
        new Platform(700, 120, 80, 20),
        this._rockBlocker,
        this._room1RockVisual,
        this._room1RockHint,
      ],
      {
        left: { targetRoomIndex: 0 },
        right: { targetRoomIndex: 2 },
      },
    );

    this._room2TurretHint = new TextPrompt(420, 400, this, {
      textKey: "level8_room2_prompt",
      textSize: 18,
      width: 470,
      height: 130,
      visibilityFn: () => this._chestOpened && !this._turretDestroyed,
    });

    this._room2Turret = new Level8Turret(702, 344, 110, 116);
    this._room2ExitPortal = new Portal(p.width - 120, 80, 50, 50);

    const room2 = new Room(
      [
        new Ground(0, 0, p.width, 80),
        new Platform(180, 140, 120, 20),
        new Platform(360, 220, 120, 20),
        new Platform(560, 300, 150, 20),
        this._room2Turret,
        this._room2TurretHint,
        new Wall(p.width - WALL_THICKNESS, 0, WALL_THICKNESS, p.height),
        this._room2ExitPortal,
      ],
      { left: { targetRoomIndex: 1 } },
    );

    return [room0, room1, room2];
  }

  _applyWorldOffsetsToRooms(p) {
    for (let i = 0; i < this.rooms.length; i++) {
      const offsetX = i * p.width;
      for (const entity of this.rooms[i].entities) {
        entity.x += offsetX;
      }
    }
  }

  _buildEntities() {
    const set = new Set();
    for (const room of this.rooms) {
      for (const entity of room.entities) {
        set.add(entity);
      }
    }
    set.add(this._player);
    if (this._replayer) {
      set.add(this._replayer);
    }
    return set;
  }

  _rebuildEntities() {
    this.entities = this._buildEntities();
    this.physicsSystem.setEntities(this.entities);
    this.collisionSystem.setEntities(this.entities);
  }

  _checkRoomTransition(p) {
    const player = this._player;
    const room = this.rooms[this._activeRoomIndex];
    const leftBound = this._activeRoomIndex * p.width;
    const rightBound = leftBound + p.width;
    const playerCenterX = player.x + player.collider.w / 2;

    if (playerCenterX > rightBound && room.exits.right) {
      this._switchRoom(room.exits.right.targetRoomIndex, "right");
    } else if (playerCenterX < leftBound && room.exits.left) {
      this._switchRoom(room.exits.left.targetRoomIndex, "left");
    }
  }

  _switchRoom(roomIndex, direction) {
    if (roomIndex === this._activeRoomIndex) {
      return;
    }
    const fromRoomIndex = this._activeRoomIndex;
    this._activeRoomIndex = roomIndex;
    this._transition = {
      fromRoomIndex,
      toRoomIndex: roomIndex,
      direction,
      elapsedMs: 0,
    };
  }

  _easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  _updateTransition(p) {
    if (!this._transition) {
      return;
    }
    this._transition.elapsedMs += p.deltaTime || 16;
    if (this._transition.elapsedMs >= this._transitionDurationMs) {
      this._transition = null;
    }
  }

  _getCameraX(p) {
    if (!this._transition) {
      return this._activeRoomIndex * p.width;
    }
    const t = Math.min(1, this._transition.elapsedMs / this._transitionDurationMs);
    if (!this._transition) return;
    this._transition.elapsedMs += p.deltaTime || 16;
    if (this._transition.elapsedMs >= this._transitionDurationMs)
      this._transition = null;
  }

  _getCameraX(p) {
    if (!this._transition) return this._activeRoomIndex * p.width;
    const t = Math.min(
      1,
      this._transition.elapsedMs / this._transitionDurationMs,
    );
    const eased = this._easeOutCubic(t);
    const fromX = this._transition.fromRoomIndex * p.width;
    const toX = this._transition.toRoomIndex * p.width;
    return fromX + (toX - fromX) * eased;
  }

  getViewBounds(p = this.p) {
    const cameraX = this._getCameraX(p);
    return {
      minX: cameraX,
      maxX: cameraX + p.width,
      minY: 0,
      maxY: p.height,
    };
  }

  clearLevel(p = this.p, eventBus = this.eventBus) {
    document.removeEventListener("keydown", this._onLevelKeyDown);
    this._activeBombs.length = 0;
    this._activeEffects.length = 0;
    super.clearLevel(p, eventBus);
  }

  addReplayer(startX, startY) {
    if (this._replayer === null) {
      this._replayer = new Replayer(startX, startY, PLAYER_SIZE, PLAYER_SIZE);
      this._replayer.createListeners();
      this.entities.add(this._replayer);
      this.physicsSystem.setEntities(this.entities);
      this.collisionSystem.setEntities(this.entities);
      return this._replayer;
    }
    return this._replayer;
  }

  removeReplayer() {
    if (this._replayer !== null) {
      this._replayer.clearEventListeners();
      this.entities.delete(this._replayer);
      this._replayer = null;
      this.physicsSystem.setEntities(this.entities);
      this.collisionSystem.setEntities(this.entities);
    }
  }

  getPlayer() {
    return this._player ?? null;
  }

  getReplayer() {
    return this._replayer ?? null;
  }

  clearCanvas(p = this.p, cameraNudgeX = 0, bgParallaxFactor = 1) {
    const cameraX = this._getCameraX(p);
    const bgOffsetX = cameraNudgeX * bgParallaxFactor;
    const bg = Assets.bgImageLevel8;

    if (bg) {
      p.push();
      p.translate(-cameraX - bgOffsetX, 0);
      p.scale(1, -1);
      for (let i = 0; i < this.rooms.length; i++) {
        const scaleX = p.width / bg.width;
        const scaleY = p.height / bg.height;
        const scale = Math.max(scaleX, scaleY) * 1.05;
        p.image(
          bg,
          i * p.width,
          -p.height,
          bg.width * scale,
          bg.height * scale,
        );
      }
      p.pop();
      return;
    }

    p.background(22, 17, 35);
    p.noStroke();
    p.fill(40, 28, 62);
    p.rect(0, 0, p.width, p.height * 0.45);
  }

  updatePhysics() {
    this.physicsSystem.physicsEntry();

    for (const entity of this.entities) {
      if (entity.update && typeof entity.update === "function") {
        entity.update(this.p);
      }
      if (entity.update && typeof entity.update === "function")
        entity.update(this.p);
    }

    this._updateChestPromptVisibility();
    this._updateBombs();
    this._updateEffects();
    this._updateTurretSecurity();
    this._checkExitUnlock();
  }

  updateCollision(p = this.p, eventBus = this.eventBus) {
    this.collisionSystem.collisionEntry(eventBus);
    this._spawnChestIfReady();

    if (this._transition) {
      this._updateTransition(p);
      return;
    }

    this._checkRoomTransition(p);
  }

  draw(p = this.p) {
    const cameraX = this._getCameraX(p);

    p.push();
    p.translate(-cameraX, 0);

    for (const entity of this.entities) {
      if (entity.type === "spike") entity.draw(p);
    }
    for (const entity of this.entities) {
      if (entity.type === "ground") entity.draw(p);
    }
    for (const entity of this.entities) {
      if (entity.type === "spike") {
        entity.draw(p);
      }
    }
    for (const entity of this.entities) {
      if (entity.type === "ground") {
        entity.draw(p);
      }
    }
    for (const entity of this.entities) {
      if (
        entity.type !== "spike" &&
        entity.type !== "ground" &&
        !entity._hidden
      ) {
        entity.draw(p);
      }
    }

    this._drawTurretBeam(p);

    for (const bomb of this._activeBombs) {
      bomb.draw(p);
    }
    for (const effect of this._activeEffects) {
      effect.draw(p);
    }

    p.pop();

    if (this.recordSystem.draw) {
      this.recordSystem.draw(p);
    }
    this._drawLevelHud(p);
  }

  _handleLevelKeyDown(event) {
    if (isGamePaused()) {
      return;
    }

    if (event.repeat) {
      return;
    }

    const interactionKey = this._keyBindingManager.getKeyByIntent("interaction");
    if (interactionKey && event.code === interactionKey) {
      this._tryOpenChest();
      return;
    }

    if (event.code === "Digit1") {
      this._tryPlaceBombAtReplayer();
    }
  }

  _updateChestPromptVisibility() {
    if (!this._room0ChestPrompt) {
      return;
    }

    this._room0ChestPrompt._hidden = !this._room0Chest.visible || this._room0Chest.opened;
  }

  _spawnChestIfReady() {
    if (this._chestSpawned) {
      return;
    }

    if (this._room0ButtonGround.isPressed && this._room0ButtonUpper.isPressed) {
      this._chestSpawned = true;
      this._room0Chest.visible = true;
      this._showNotice("level8_notice_chest_spawned");
    }
  }

  _tryOpenChest() {
    if (!this._room0Chest.visible || this._room0Chest.opened) {
      return;
    }

    if (
      !this._isPlayerNearRect(
        this._room0Chest.x,
        this._room0Chest.y,
        this._room0Chest.w,
        this._room0Chest.h,
        64,
      )
    ) {
      this._showNotice("level8_notice_move_closer");
      return;
    }

    this._room0Chest.opened = true;
    this._chestOpened = true;
    this._bombCount = 2;
    this._showNotice("level8_notice_opened_chest", 3200);
  }

  _tryPlaceBombAtReplayer() {
    const nowMs = performance.now();

    if (nowMs < this._bombDeployCooldownUntilMs) {
      return;
    }

    if (
      this.recordSystem.state !== "Replaying" ||
      !this._replayer ||
      !this._replayer.isReplaying
    ) {
      this._showNotice("level8_notice_need_replay");
      return;
    }

    if (!this._chestOpened) {
      this._showNotice("level8_notice_need_chest");
      return;
    }

    if (this._bombCount <= 0) {
      this._showNotice("level8_notice_no_bombs");
      return;
    }

    const bombX = this._replayer.x + this._replayer.collider.w / 2 - BOMB_SIZE / 2;
    const bombY = this._replayer.y + 4;

    this._activeBombs.push(
      new Level8Bomb(bombX, bombY, BOMB_SIZE, BOMB_TIMER_MS, BOMB_RADIUS),
    );
    this._bombCount -= 1;
    this._bombDeployCooldownUntilMs = nowMs + REPLAY_BOMB_COOLDOWN_MS;
  }

  _updateBombs() {
    const nowMs = performance.now();

    for (let i = this._activeBombs.length - 1; i >= 0; i--) {
      const bomb = this._activeBombs[i];
      bomb.update(nowMs);
      if (!bomb.shouldExplode(nowMs)) {
        continue;
      }

      this._explodeBomb(bomb);
      this._activeBombs.splice(i, 1);
    }
  }

  _explodeBomb(bomb) {
    const center = bomb.getCenter();
    this._activeEffects.push(
      new Level8ExplosionEffect(center.x, center.y, bomb.radius),
    );

    if (!this._rockDestroyed) {
      const hitRock = this._circleHitsRect(
        center.x,
        center.y,
        bomb.radius,
        this._rockBlocker.x,
        this._rockBlocker.y,
        this._rockBlocker.collider.w,
        this._rockBlocker.collider.h,
      );
      if (hitRock) {
        this._rockDestroyed = true;
        this._room1RockVisual.setDestroyed(true);
        this._setStaticEntityGone(this._rockBlocker, true);
      }
    }

    if (!this._turretDestroyed) {
      const hitTurret = this._circleHitsRect(
        center.x,
        center.y,
        bomb.radius,
        this._room2Turret.x,
        this._room2Turret.y,
        this._room2Turret.w,
        this._room2Turret.h,
      );
      if (hitTurret) {
        this._turretDestroyed = true;
        this._room2Turret.setDestroyed(true);
        this._turretLockElapsedMs = 0;
      }
    }

    const playerHit = this._circleHitsRect(
      center.x,
      center.y,
      bomb.radius,
      this._player.x,
      this._player.y,
      this._player.collider.w,
      this._player.collider.h,
    );
    if (playerHit) {
      this._failLevel();
      return;
    }

    if (
      this._replayer &&
      this._replayer.isReplaying &&
      this._circleHitsRect(
        center.x,
        center.y,
        bomb.radius,
        this._replayer.x,
        this._replayer.y,
        this._replayer.collider.w,
        this._replayer.collider.h,
      )
    ) {
      this.recordSystem.transition("replay");
    }
  }

  _updateEffects() {
    for (let i = this._activeEffects.length - 1; i >= 0; i--) {
      const effect = this._activeEffects[i];
      effect.update();
      if (effect.isFinished()) {
        this._activeEffects.splice(i, 1);
      }
    }
  }

  _updateTurretSecurity() {
    if (this._turretDestroyed) {
      this._turretLockElapsedMs = 0;
      return;
    }

    if (
      this.recordSystem.state === "Recording" ||
      this.recordSystem.state === "Replaying"
    ) {
      this._turretLockElapsedMs = 0;
      return;
    }

    const playerCenterX = this._player.x + this._player.collider.w / 2;
    const playerCenterY = this._player.y + this._player.collider.h / 2;
    const turretCenterX = this._room2Turret.x + this._room2Turret.w / 2;
    const turretCenterY = this._room2Turret.y + this._room2Turret.h * 0.55;

    const dx = playerCenterX - turretCenterX;
    const dy = playerCenterY - turretCenterY;
    const inDangerZone =
      playerCenterX > this._room2Turret.x - 120 &&
      playerCenterX < this._room2Turret.x + 170 &&
      Math.abs(dx) < 250 &&
      Math.abs(dy) < 240;

    if (!inDangerZone) {
      this._turretLockElapsedMs = 0;
      return;
    }

    this._turretLockElapsedMs += this.p.deltaTime || 16;
    if (this._turretLockElapsedMs >= TURRET_LOCK_TIME_MS) {
      this._failLevel();
    }
  }

  _checkExitUnlock() {
    if (this._exitUnlocked) {
      return;
    }

    if (this._rockDestroyed && this._turretDestroyed) {
      this._exitUnlocked = true;
      this._room2ExitPortal.openPortal();
      this._showNotice("level8_notice_exit_ready", 3200);
    }
  }

  _setStaticEntityGone(entity, gone) {
    if (!entity || !entity.collider) {
      return;
    }

    if (!entity._origColliderType) {
      entity._origColliderType = entity.collider.colliderType;
    }

    entity._hidden = !!gone;
    entity.collider.colliderType = gone
      ? ColliderType.TRIGGER
      : entity._origColliderType;

    if (this.collisionSystem) {
      this.collisionSystem.partitionEntitiesByType();
    }
  }

  _circleHitsRect(cx, cy, radius, rx, ry, rw, rh) {
    const nearestX = Math.max(rx, Math.min(cx, rx + rw));
    const nearestY = Math.max(ry, Math.min(cy, ry + rh));
    const dx = cx - nearestX;
    const dy = cy - nearestY;
    return dx * dx + dy * dy <= radius * radius;
  }

  _isPlayerNearRect(x, y, w, h, range) {
    const playerCenterX = this._player.x + this._player.collider.w / 2;
    const playerCenterY = this._player.y + this._player.collider.h / 2;
    const rectCenterX = x + w / 2;
    const rectCenterY = y + h / 2;
    const dx = playerCenterX - rectCenterX;
    const dy = playerCenterY - rectCenterY;
    return dx * dx + dy * dy <= range * range;
  }

  _showNotice(key, durationMs = 2200) {
    this._noticeKey = key;
    this._noticeUntilMs = performance.now() + durationMs;
  }

  _drawLevelHud(p) {
    const nowMs = performance.now();
    const clearedCount =
      (this._rockDestroyed ? 1 : 0) + (this._turretDestroyed ? 1 : 0);

    p.push();
    p.resetMatrix();

    const panelX = 20;
    const panelY = 16;
    const panelW = 272;
    const panelH = 110;

    p.noStroke();
    p.fill(45, 20, 70, 170);
    p.rect(panelX, panelY, panelW, panelH, 10);
    p.stroke(255, 226, 160, 120);
    p.strokeWeight(1.5);
    p.noFill();
    p.rect(panelX, panelY, panelW, panelH, 10);

    p.noStroke();
    p.fill(255, 240, 210);
    if (Assets.customFont) {
      p.textFont(Assets.customFont);
    }
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(16);
    p.text(`${t("level8_hud_bombs")}: ${this._bombCount}`, panelX + 16, panelY + 16);
    p.text(
      `${t("level8_hud_objectives")}: ${clearedCount}/2`,
      panelX + 16,
      panelY + 42,
    );

    if (this.recordSystem.state === "Replaying" && this._bombCount > 0) {
      p.fill(255, 212, 120);
      p.textSize(14);
      p.text(t("level8_hud_place_bomb"), panelX + 16, panelY + 74);
    }

    if (this._noticeKey && nowMs < this._noticeUntilMs) {
      p.noStroke();
      p.fill(34, 18, 56, 210);
      p.rect(p.width / 2 - 240, 18, 480, 52, 10);
      p.stroke(255, 226, 160, 120);
      p.noFill();
      p.rect(p.width / 2 - 240, 18, 480, 52, 10);
      p.noStroke();
      p.fill(255, 247, 224);
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(15);
      p.text(t(this._noticeKey), p.width / 2, 44);
    }

    p.pop();
  }

  _drawTurretBeam(p) {
    if (this._turretDestroyed || this._turretLockElapsedMs <= 0) {
      return;
    }

    const ratio = Math.min(1, this._turretLockElapsedMs / TURRET_LOCK_TIME_MS);
    const turretCenterX = this._room2Turret.x + this._room2Turret.w / 2;
    const turretCenterY = this._room2Turret.y + this._room2Turret.h * 0.55;
    const playerCenterX = this._player.x + this._player.collider.w / 2;
    const playerCenterY = this._player.y + this._player.collider.h / 2;

    p.push();
    p.stroke(255, 90, 120, 80 + ratio * 140);
    p.strokeWeight(2 + ratio * 3);
    p.line(turretCenterX, turretCenterY, playerCenterX, playerCenterY);
    p.noStroke();
    p.fill(255, 80, 110, 90 + ratio * 110);
    p.circle(playerCenterX, playerCenterY, 14 + ratio * 18);
    p.pop();
  }

  _failLevel() {
    if (this.eventBus) {
      this.eventBus.publish(EventTypes.AUTO_RESULT, "autoResult2");
    }
  }
}

class Level8SpawnBeacon extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y);
    this.type = "level8_spawn_beacon";
    this.w = w;
    this.h = h;
    this._frame = 0;
  }

  update() {
    this._frame += 1;
  }

  draw(p) {
    const glow = 120 + Math.sin(this._frame * 0.05) * 50;
    p.push();
    p.noStroke();
    p.fill(120, 220, 255, 44);
    p.rect(this.x - 10, this.y, this.w + 20, this.h + 14, 12);
    p.stroke(130, 225, 255, glow);
    p.strokeWeight(3);
    p.noFill();
    p.rect(this.x, this.y, this.w, this.h, 10);
    p.stroke(220, 248, 255, glow * 0.65);
    p.strokeWeight(1.5);
    p.rect(this.x + 6, this.y + 6, this.w - 12, this.h - 12, 8);
    p.pop();
  }
}

class Level8Chest extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y);
    this.type = "level8_chest";
    this.w = w;
    this.h = h;
    this.visible = false;
    this.opened = false;
  }

  draw(p) {
    if (!this.visible) {
      return;
    }

    p.push();
    p.noStroke();
    p.fill(92, 54, 26);
    p.rect(this.x, this.y, this.w, this.h - 8, 4);
    p.fill(220, 170, 68);
    p.rect(this.x, this.y + this.h - 8, this.w, 8, 4, 4, 0, 0);
    p.fill(255, 225, 120);
    p.rect(this.x + this.w / 2 - 4, this.y + 5, 8, 12, 2);

    if (this.opened) {
      p.fill(255, 230, 130, 160);
      p.triangle(
        this.x + 4,
        this.y + this.h - 2,
        this.x + this.w - 4,
        this.y + this.h - 2,
        this.x + this.w / 2,
        this.y + this.h + 16,
      );
    }
    p.pop();
  }
}

class Level8RockPile extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y);
    this.type = "level8_rock_pile";
    this.w = w;
    this.h = h;
    this.destroyed = false;
  }

  setDestroyed(v) {
    this.destroyed = !!v;
  }

  draw(p) {
    p.push();
    p.noStroke();
    if (!this.destroyed) {
      p.fill(88, 90, 102);
      p.rect(this.x + 28, this.y, this.w - 56, this.h * 0.55, 10);
      p.fill(116, 120, 138);
      p.circle(this.x + 42, this.y + 34, 44);
      p.circle(this.x + 82, this.y + 76, 64);
      p.circle(this.x + 122, this.y + 34, 56);
      p.circle(this.x + 74, this.y + 128, 52);
      p.circle(this.x + 146, this.y + 100, 58);
      p.circle(this.x + 108, this.y + 164, 46);
    } else {
      p.fill(88, 90, 102, 170);
      p.rect(this.x + 20, this.y, this.w - 40, 28, 8);
      p.fill(126, 130, 150, 180);
      p.circle(this.x + 46, this.y + 18, 28);
      p.circle(this.x + 88, this.y + 12, 24);
      p.circle(this.x + 126, this.y + 20, 22);
    }
    p.pop();
  }
}

class Level8Turret extends GameEntity {
  constructor(x, y, w, h) {
    super(x, y);
    this.type = "level8_turret";
    this.w = w;
    this.h = h;
    this.destroyed = false;
    this._frame = 0;
  }

  setDestroyed(v) {
    this.destroyed = !!v;
  }

  update() {
    this._frame += 1;
  }

  draw(p) {
    p.push();
    p.noStroke();

    if (!this.destroyed) {
      const pulse = 150 + Math.sin(this._frame * 0.07) * 50;
      p.fill(70, 54, 102);
      p.rect(this.x + 12, this.y, this.w - 24, this.h * 0.54, 10);
      p.fill(98, 78, 140);
      p.rect(this.x + 24, this.y + this.h * 0.42, this.w - 48, this.h * 0.32, 8);
      p.fill(245, 70, 110, pulse);
      p.circle(this.x + this.w * 0.5, this.y + this.h * 0.56, 18);
      p.fill(255, 210, 120, 170);
      p.rect(this.x + this.w * 0.5 - 8, this.y + this.h * 0.24, 16, 34, 4);
    } else {
      p.fill(70, 54, 102, 120);
      p.rect(this.x + 10, this.y, this.w - 20, 26, 8);
      p.fill(108, 86, 148, 150);
      p.rect(this.x + 34, this.y + 18, 36, 20, 6);
      p.rect(this.x + 72, this.y + 10, 24, 14, 4);
    }

    p.pop();
  }
}

class Level8Bomb {
  constructor(x, y, size, durationMs, radius) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.durationMs = durationMs;
    this.radius = radius;
    this.startMs = performance.now();
  }

  update(_nowMs) {}

  getCenter() {
    return {
      x: this.x + this.size / 2,
      y: this.y + this.size / 2,
    };
  }

  shouldExplode(nowMs) {
    return nowMs - this.startMs >= this.durationMs;
  }

  draw(p) {
    const nowMs = performance.now();
    const elapsed = nowMs - this.startMs;
    const remainMs = Math.max(0, this.durationMs - elapsed);
    const blink = Math.sin(nowMs * 0.02) > 0 ? 1 : 0.55;

    p.push();
    p.noStroke();
    p.fill(35, 35, 42);
    p.circle(this.x + this.size / 2, this.y + this.size / 2, this.size);
    p.fill(255, 90, 110, 180 + 50 * blink);
    p.circle(this.x + this.size / 2, this.y + this.size / 2, this.size * 0.42);
    p.stroke(255, 220, 120);
    p.strokeWeight(2);
    p.line(
      this.x + this.size / 2,
      this.y + this.size,
      this.x + this.size / 2 + 8,
      this.y + this.size + 10,
    );
    p.noStroke();
    p.fill(255, 240, 220, 230);
    p.translate(this.x + this.size / 2, this.y + this.size + 26);
    p.scale(1, -1);
    p.textAlign(p.CENTER, p.CENTER);
    if (Assets.customFont) {
      p.textFont(Assets.customFont);
    }
    p.textSize(12);
    p.text((remainMs / 1000).toFixed(1), 0, 0);
    p.pop();
  }
}

class Level8ExplosionEffect {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.life = 18;
    this.maxLife = 18;
  }

  update() {
    this.life -= 1;
  }

  isFinished() {
    return this.life <= 0;
  }

  draw(p) {
    const t = 1 - this.life / this.maxLife;
    const alpha = 180 * (1 - t);
    const r = this.radius * (0.18 + t * 0.82);

    p.push();
    p.noFill();
    p.stroke(255, 210, 120, alpha);
    p.strokeWeight(10 * (1 - t) + 2);
    p.circle(this.x, this.y, r * 2);
    p.stroke(255, 120, 90, alpha * 0.8);
    p.strokeWeight(4 * (1 - t) + 1);
    p.circle(this.x, this.y, r * 1.35);
    p.pop();
  }
}
