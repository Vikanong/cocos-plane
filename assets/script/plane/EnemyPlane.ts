import { _decorator, Component, Node, BoxCollider2D, Collider2D, Contact2DType, Animation, Sprite } from 'cc';
import { Constant } from '../framework/Constant';
import { GameManager } from '../framework/GameManager';
import { PoolManager } from '../framework/PoolManager';
const { ccclass, property } = _decorator;

const outofbounce = -700;

@ccclass('EnemyPlane')
export class EnemyPlane extends Component {
    @property
    public createdBulletTime = 2;

    private _enemySpeed = 1;
    private _needBullet = false;
    private _gameManager: GameManager = null;

    private _currCreatedBulletTime = 0;

    private _isCollide = false;
    private _animation = null;

    private _spriteFrame = null;

    start() {
        this._spriteFrame = this.node.getChildByName('spriteFrame').getComponent(Sprite).spriteFrame;
    }

    onEnable() {
        this._animation = this.node.getComponent(Animation);
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onDisable() {
        const collider = this.getComponent(BoxCollider2D);
        if (collider) {
            collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);

        }
    }

    update(deltaTime: number) {
        const pos = this.node.position;
        const movePos = pos.y - this._enemySpeed;
        this.node.setPosition(pos.x, movePos);
        if (this._needBullet) {
            this._currCreatedBulletTime += deltaTime;
            if (this._currCreatedBulletTime > this.createdBulletTime) {
                this._gameManager.createEnmeyBullet(this.node.position);
                this._currCreatedBulletTime = 0;
            }
        }
        if (movePos < outofbounce) {
            PoolManager.instance().putNode(this.node);
        }
    }

    show(gameManager: GameManager, speed: number, needBullet: boolean) {
        this._gameManager = gameManager;
        this._enemySpeed = speed;
        this._needBullet = needBullet;
        this._isCollide = true;
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        if (!this._isCollide) return;
        this._isCollide = false;

        const collosionGroup = otherCollider.group;

        if (collosionGroup == Constant.CollistionType.SELF_PLAN || collosionGroup == Constant.CollistionType.SELF_BULLET) {

            // 与玩家飞机
            if (collosionGroup == Constant.CollistionType.SELF_PLAN) {
                this._gameManager.playAudioEffect("enemy1");
            }

            // 与玩家子弹
            if (collosionGroup == Constant.CollistionType.SELF_BULLET) {
                this._gameManager.playAudioEffect("enemy2");

                // 判断敌方飞机类型
                if (selfCollider.node.name === 'enemy1') {
                    this._animation.play('enemy1Down');
                } else if (selfCollider.node.name === 'enemy2') {
                    this._animation.play('enemy2Down');
                }


                this._animation.on(Animation.EventType.FINISHED, this.onDieAnimationEvent, this);
            }
            this._gameManager.addScore();
        }
    }

    private onDieAnimationEvent() {
        const _sprite: Sprite = this.node.getChildByName('spriteFrame').getComponent(Sprite);
        _sprite.spriteFrame = this._spriteFrame;
        PoolManager.instance().putNode(this.node);
    }
}

