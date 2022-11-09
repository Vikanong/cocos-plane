import { _decorator, Component, Node, Prefab, math, Vec2, macro, Label, director, SpriteFrame, AudioSource } from 'cc';
import { Bullet } from '../bullet/Bullet';
import { BulletProp } from '../bullet/BulletProp';
import { EnemyPlane } from '../plane/EnemyPlane';
import { SelfPlane } from '../plane/SelfPlane';
import { AudioManager } from './AudioManager';
import { Constant } from './Constant';
import { PoolManager } from './PoolManager';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(SelfPlane)
    public playerPlane: SelfPlane = null;

    @property(Prefab)
    public bullet02: Prefab = null;

    @property(Prefab)
    public bullet04: Prefab = null;

    @property(Node)
    public bulletRoot: Node = null;

    @property(Prefab)
    public enemyPlane01: Prefab = null;

    @property(Prefab)
    public enemyPlane02: Prefab = null;

    @property(Prefab)
    public enemyPlane03: Prefab = null;

    @property
    public createEnemyTime = 1;

    @property
    public enemy1Speed = 1;

    @property
    public enemy2Speed = 2;

    // bullet Prop
    @property(Prefab)
    public bulletPropM: Prefab = null;
    @property(Prefab)
    public bulletPropH: Prefab = null;
    @property(Prefab)
    public bulletPropS: Prefab = null;
    @property
    public bulletPropSpeed = 1;

    @property(Node)
    public gamePage: Node = null;
    @property(Node)
    public gameOverPage: Node = null;
    @property(Label)
    public gameScore: Label = null;
    @property(Label)
    public gameOverScore: Label = null;

    @property(SpriteFrame)
    public pauseIcon: SpriteFrame = [];

    @property(AudioManager)
    public audioEffect: AudioManager = null;

    @property(AudioSource)
    public bgmAudioSource: AudioSource = null;

    private isGameStart = false;
    private _currCreateEnemyTime = 0;
    private _combinationInterval = Constant.Combination.PLANE1;
    private _windowTop = 800;
    private _score = 0;

    start() {
        this._init();
    }

    update(deltaTime: number) {
        if (!this.isGameStart) return;
        if (this.playerPlane.isDie) {
            this.gameOver();
            return;
        }

        this._currCreateEnemyTime += deltaTime;

        if (this._combinationInterval === Constant.Combination.PLANE1) {
            if (this._currCreateEnemyTime > this.createEnemyTime) {
                this.createdEnemyPlane();
                this._currCreateEnemyTime = 0;
            }
        } else if (this._combinationInterval === Constant.Combination.PLANE2) {
            if (this._currCreateEnemyTime > this.createEnemyTime * 4) {
                const randomCombination = math.randomRangeInt(1, 3);
                if (randomCombination === Constant.Combination.PLANE2) {
                    this.createdCombination1();
                } else {
                    this.createdEnemyPlane();
                }

                this._currCreateEnemyTime = 0;
            }
        } else {
            if (this._currCreateEnemyTime > this.createEnemyTime * 8) {
                const randomCombination = math.randomRangeInt(1, 4);
                if (randomCombination === Constant.Combination.PLANE2) {
                    this.createdCombination1();
                } else if (randomCombination === Constant.Combination.PLANE3) {
                    this.createdCombination2();
                } else {
                    this.createdEnemyPlane();
                }

                this._currCreateEnemyTime = 0;
            }

        }
    }

    public createdEnemyPlane() {
        const whichEnemy = math.randomRangeInt(1, 3);
        let prefab: Prefab = null;
        let speed = 0;
        if (whichEnemy === Constant.EnemyPlaneType.TYPE1) {
            prefab = this.enemyPlane01;
            speed = this.enemy1Speed;
        } else {
            prefab = this.enemyPlane02;
            speed = this.enemy2Speed;
        }


        const enemy = PoolManager.instance().getNode(prefab, this.node);
        const enemyComp = enemy.getComponent(EnemyPlane);

        enemyComp.show(this, speed, true);

        const randomPos = math.randomRangeInt(-320, 320);
        enemy.setPosition(randomPos, this._windowTop);
    }

    public createdCombination1() {
        const enemyArray = new Array<Node>(5);
        for (let i = 0; i < enemyArray.length; i++) {
            enemyArray[i] = PoolManager.instance().getNode(this.enemyPlane01, this.node);
            const elemet = enemyArray[i];
            elemet.setPosition(-260 + i * 130, this._windowTop);
            const enemyComp = elemet.getComponent(EnemyPlane);
            enemyComp.show(this, this.enemy1Speed, false);
        }
    }


    public createdCombination2() {
        const enemyArray = new Array<Node>(7);
        const spacing = 80;
        const combinationPos = [
            -(spacing * 3), this._windowTop + spacing * 3,
            -(spacing * 2), this._windowTop + spacing * 2,
            -spacing, this._windowTop + spacing,
            0, this._windowTop,
            spacing, this._windowTop + spacing,
            spacing * 2, this._windowTop + spacing * 2,
            spacing * 3, this._windowTop + spacing * 3,
        ];

        for (let i = 0; i < enemyArray.length; i++) {
            enemyArray[i] = PoolManager.instance().getNode(this.enemyPlane02, this.node);
            const elemet = enemyArray[i];
            const startIndex = i * 2;
            elemet.setPosition(combinationPos[startIndex], combinationPos[startIndex + 1]);
            const enemyComp = elemet.getComponent(EnemyPlane);
            enemyComp.show(this, this.enemy2Speed, false);
        }
    }

    public createEnmeyBullet(targetPos: Vec2) {
        const bullet = PoolManager.instance().getNode(this.bullet02, this.bulletRoot);
        bullet.setPosition(targetPos.x, targetPos.y);

        const bulletComp = bullet.getComponent(Bullet);
        bulletComp.show(6, true);

        // const colliderComp = bullet.getComponent(Collider2D);
        // console.log(colliderComp);
        // colliderComp.setGroup(Constant.CollistionType.ENEMY_BULLET);
        // colliderComp.setMask(Constant.CollistionType.SELF_PLAN);
    }

    public createBulletProp() {
        let prefab: Prefab = null;
        const randomProp = math.randomRangeInt(1, 4);

        if (randomProp === Constant.BulletPropType.BULLET_H) {
            prefab = this.bulletPropH;
        } else if (randomProp === Constant.BulletPropType.BULLET_S) {
            prefab = this.bulletPropS;
        } else {
            prefab = this.bulletPropM;
        }

        const prop = PoolManager.instance().getNode(prefab, this.node);
        prop.setPosition(200, 700);
        const propComp = prop.getComponent(BulletProp);
        propComp.show(this.playerPlane, -this.bulletPropSpeed)
    }

    public isShooting(value: boolean) {
        this._isShooting = value;
    }

    private changePlaneMode() {
        if (!this.isGameStart) return;
        this.schedule(this._modeChanged, 8, macro.REPEAT_FOREVER);
        this.schedule(this.createBulletProp, 25, macro.REPEAT_FOREVER);
    }

    private _modeChanged() {
        this._combinationInterval++;
    }

    public addScore() {
        this._score++;
        this.gameScore.string = this._score.toString();
    }

    // 返回首页
    public returnMain() {
        this.isGameStart = false;
        this._currCreateEnemyTime = 0;
        this._combinationInterval = Constant.Combination.PLANE1;
        this._score = 0;

        director.loadScene("start");
    }

    // 重新开始
    public reStart() {
        this.playAudioEffect('button');
        this.gameOverPage.active = false;
        this._currCreateEnemyTime = 0;
        this._combinationInterval = Constant.Combination.PLANE1;
        this._score = 0;
        this.gameScore.string = this._score.toString();
        this._init();
        this.playerPlane.resetPlayer();
        this.bgmAudioSource.play();
    }

    // 游戏结束
    public gameOver() {
        this.playAudioEffect('button');
        this.node.destroyAllChildren();
        this.bulletRoot.destroyAllChildren();
        this.playerPlane.isShooting(false);

        this.isGameStart = false;
        this.gamePage.active = false;

        this.gameScore.string = this._score.toString();
        this.gameOverScore.string = this._score.toString();

        this.gameOverPage.active = true;

        this.unschedule(this._modeChanged);
        this.unschedule(this.createBulletProp);

        this.bgmAudioSource.stop();
    }


    // 游戏暂停
    public gamePause(event) {
        const is = director.isPaused();
        const sprite = this.gamePage.getChildByName('pause').getComponent(cc.Sprite);
        this.playAudioEffect('button');
        if (is) {
            director.resume();
            sprite.spriteFrame = this.pauseIcon[0];
            this.bgmAudioSource.play();
            this.playerPlane.isPause = false;
        } else {
            director.pause();
            sprite.spriteFrame = this.pauseIcon[1];
            this.bgmAudioSource.pause();
            this.playerPlane.isPause = true;
        }
    }

    public playAudioEffect(name: string) {
        this.audioEffect.play(name);
    }


    private _init() {
        this.isGameStart = true;
        this.gamePage.active = true;
        this.changePlaneMode();
    }
}