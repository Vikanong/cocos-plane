import { _decorator, Component, Node, director, AudioSource, Animation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Start')
export class Start extends Component {

    @property(Node)
    public loading: Node = null;

    @property(AudioSource)
    public startAudio: AudioSource = null;

    start() {
        director.preloadScene("game");
    }


    onStart() {
        let animation = this.loading.getComponent(Animation);
        animation.play('startLoading');
        this.startAudio.play();
        animation.on(Animation.EventType.FINISHED, this.startGame, this);
    }

    startGame() {
        director.loadScene("game");
    }
}

