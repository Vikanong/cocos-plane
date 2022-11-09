import { _decorator, Component, Node, Prefab, NodeEventType, PolygonCollider2D, Collider2D, Contact2DType, Animation, UITransform } from 'cc';
import { Constant } from '../framework/Constant';
import { GameManager } from '../framework/GameManager';
import { Bullet } from '../bullet/Bullet';
import { AudioManager } from '../framework/AudioManager';
import { PoolManager } from '../framework/PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SelfPlane')
export class SelfPlane extends Component {
    public speed = 1;

    public playerHP = 10;
    public _currLife = 0;
    public isDie = false;
    public isPause = false;

    private _currShootTime = 0;
    private _isShooting = false;
    private _bulletType = Constant.BulletPropType.BULLET_M;
    private _bloodWidth = 230;

    @property
    public shootTime = 0.3;
    @property
    public bulletSpeed = 20;

    @property(Prefab)
    public bullet01: Prefab = null;

    @property(Prefab)
    public bullet03: Prefab = null;

    @property(Prefab)
    public bullet05: Prefab = null;

    @property(Node)
    public bulletRoot: Node = null;

    @property(AudioManager)
    public audioEffect: AudioManager = null;

    @property(Node)
    public bloodNode: Node = null;

    start() {
        this.node.on(NodeEventType.TOUCH_START, this._touchStart, this);
        this.node.on(NodeEventType.TOUCH_MOVE, this._touchMove, this);
        this.node.on(NodeEventType.TOUCH_END, this._touchEnd, this);
        // input.on(Input.EventType.TOUCH_MOVE, this._touchMove, this);
        this._init();
    }


    onEnable() {
        const collider = this.getComponent(PolygonCollider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDisable() {
        const collider = this.getComponent(PolygonCollider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    _touchStart(event: EventTouch) {
        this._isShooting = true;
    }

    _touchMove(event: EventTouch) {
        if (!this.isDie && !this.isPause) {
            const delta = event.getDelta();
            let pos = this.node.position;
            this.node.setPosition(pos.x + delta.x * this.speed, pos.y + delta.y * this.speed)
        }
    }

    _touchEnd(event: EventTouch) {
        this._isShooting = false;
    }


    update(deltaTime: number) {
        this._currShootTime += deltaTime;
        if (!this.isDie && this._isShooting && this._currShootTime > this.shootTime) {
            if (this._bulletType === Constant.BulletPropType.BULLET_H) {
                this.createPlayerBulletH();
            } else if (this._bulletType === Constant.BulletPropType.BULLET_S) {
                this.createPlayerBulletS();
            } else if (this._bulletType === Constant.BulletPropType.BULLET_M) {
                this.createPlayerBulletM();
            }
            this._currShootTime = 0;

            const name = 'bullet' + this._bulletType;
            this.audioEffect.play(name);
        }
    }

    public createPlayerBulletM() {
        const bullet = PoolManager.instance().getNode(this.bullet01, this.bulletRoot);
        const pos = this.node.position;
        bullet.setPosition(pos.x, pos.y + 70);
        const bulletComp = bullet.getComponent(Bullet);
        bulletComp.show(this.bulletSpeed, false);
    }

    public createPlayerBulletH() {
        const pos = this.node.position;

        // left
        const bullet1 = PoolManager.instance().getNode(this.bullet03, this.bulletRoot);

        bullet1.setPosition(pos.x - 32, pos.y + 30);
        const bulletComp1 = bullet1.getComponent(Bullet);
        bulletComp1.show(this.bulletSpeed, false);

        //right
        const bullet2 = PoolManager.instance().getNode(this.bullet03, this.bulletRoot);
        bullet2.setPosition(pos.x + 32, pos.y + 30);
        const bulletComp2 = bullet2.getComponent(Bullet);
        bulletComp2.show(this.bulletSpeed, false);
    }

    public createPlayerBulletS() {
        const pos = this.node.position;

        const bullet = PoolManager.instance().getNode(this.bullet05, this.bulletRoot);
        bullet.setParent(this.bulletRoot);
        bullet.setPosition(pos.x, pos.y + 70);
        const bulletComp = bullet.getComponent(Bullet);
        bulletComp.show(this.bulletSpeed, false);

        // left
        const bullet1 = PoolManager.instance().getNode(this.bullet05, this.bulletRoot);
        bullet1.setParent(this.bulletRoot);
        bullet1.setPosition(pos.x - 40, pos.y + 30);
        const bulletComp1 = bullet1.getComponent(Bullet);
        bulletComp1.show(this.bulletSpeed, false, Constant.Direction.LEFT);

        //right
        const bullet2 = PoolManager.instance().getNode(this.bullet05, this.bulletRoot);
        bullet2.setParent(this.bulletRoot);
        bullet2.setPosition(pos.x + 40, pos.y + 30);
        const bulletComp2 = bullet2.getComponent(Bullet);
        bulletComp2.show(this.bulletSpeed, false, Constant.Direction.RIGHT);
    }


    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const collosionGroup = otherCollider.group;
        if (collosionGroup == Constant.CollistionType.ENEMY_PLAN || collosionGroup == Constant.CollistionType.ENEMY_BULLET) {
            // console.log("收到了创伤");
            this._currLife--;
            this.setPlayerBlood();
            if (this._currLife <= 0) {
                this.isDie = true;
                this.audioEffect.play('player');

                let animation = this.node.getComponent(Animation);
                animation.play('playerDown');
            }
        }
    }

    public changeBulletType(type: number) {
        this.audioEffect.play('changeBullet');
        this._bulletType = type;
    }

    public isShooting(value: boolean) {
        this._isShooting = value;
    }

    public resetPlayer() {
        this.node.setPosition(0, -300);
        this._bulletType = Constant.BulletPropType.BULLET_M;
        this._init();
    }

    private setPlayerBlood() {
        const _blood = this.bloodNode.getComponent(UITransform);
        const w = this._bloodWidth / this.playerHP * this._currLife;
        _blood.setContentSize(w, 41);
    }

    _init() {
        this.isDie = false;
        this._currLife = this.playerHP;
        this._currShootTime = this.shootTime;
        let animation = this.node.getComponent(Animation);
        animation.play('engineAnimation');
        this.bloodNode.getComponent(UITransform).setContentSize(this._bloodWidth, 41);
    }
}

