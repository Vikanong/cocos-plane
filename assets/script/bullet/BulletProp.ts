import { _decorator, Component, Node, Collider, BoxCollider2D, Contact2DType } from 'cc';
import { Constant } from '../framework/Constant';
import { GameManager } from '../framework/GameManager';
import { PoolManager } from '../framework/PoolManager';
import { SelfPlane } from '../plane/SelfPlane';
const { ccclass, property } = _decorator;

@ccclass('BulletProp')
export class BulletProp extends Component {
    private _propSpeed = 1;
    private _propXSpeed = 1;
    private _gameManager: GameManager = null;

    public _playerPlane: SelfPlane = null;


    onEnable() {
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
        let pos = this.node.position;

        if (pos.x >= 200) {
            this._propXSpeed = this._propSpeed;
        } else if (pos.x <= -200) {
            this._propXSpeed = -this._propSpeed;
        }
        this.node.setPosition(pos.x + this._propXSpeed, pos.y + this._propSpeed);
        pos = this.node.position;

        if (pos.y < -700) {
            PoolManager.instance().putNode(this.node);
        }
    }

    show(playerPlane: SelfPlane, speed: number) {
        // this._gameManager = gameManager;
        this._propSpeed = speed;
        this._playerPlane = playerPlane;
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const name = selfCollider.node.name;
        if (name === "BulletH") {
            this._playerPlane.changeBulletType(Constant.BulletPropType.BULLET_H)
        } else if (name === "BulletS") {
            this._playerPlane.changeBulletType(Constant.BulletPropType.BULLET_S)
        } else {
            this._playerPlane.changeBulletType(Constant.BulletPropType.BULLET_M)
        }
        PoolManager.instance().putNode(this.node);
    }
}

