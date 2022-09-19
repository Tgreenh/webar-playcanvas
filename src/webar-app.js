import * as pc from 'playcanvas'

export class PlayCanvasApp {
  _app

  _camera

  constructor({ canvasDomElement }) {

    this._app = new pc.Application(canvasDomElement, {
      mouse: new pc.Mouse(canvasDomElement),
      touch: new pc.TouchDevice(canvasDomElement),
      keyboard: new pc.Keyboard(window),
      graphicsDeviceOptions: { alpha: true },
    });

    // use device pixel ratio
    this._app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;

    this._app.start();

    // create camera
    this._camera = new pc.Entity();
    this._camera.addComponent("camera", {
        clearColor: new pc.Color(0, 0, 0, 0),
        farClip: 10000
    });
    this._camera.translate(0, 8, 8);
    this._camera.lookAt(0, 0, 0);

    this._app.root.addChild(this._camera);

    this.initScene();

    this.configureAr();
  }

  initScene() {
    const l = new pc.Entity();
    l.addComponent("light", {
      type: "spot",
      range: 30,
    });

    l.translate(0, 10, 0);
    this._app.root.addChild(l);

    const box = new pc.Entity('cube');
    box.addComponent('model', {
        type: 'box'
    });
    this._app.root.addChild(box);

    this._app.on('update', dt => box.rotate(10 * dt, 20 * dt, 30 * dt));

    const createCube = (x, y, z) => {
      const cube = new pc.Entity();
      cube.addComponent("model", {
        type: "box",
      });

      cube.setLocalScale(0.5, 0.5, 0.5);
      cube.translate(x * 0.5, y, z * 0.5);
      this._app.root.addChild(cube);
    };

    // create a grid of cubes
    const SIZE = 4;
    for (let x = 0; x < SIZE; x++) {
      for (let y = 0; y < SIZE; y++) {
        createCube(2 * x - SIZE, 0.25, 2 * y - SIZE);
      }
    }
  }

  configureAr() {
    if (this._app.xr.supported) {
      const activate = () => {
        if (this._app.xr.isAvailable(pc.XRTYPE_AR)) {
          this._camera.camera.startXr(pc.XRTYPE_AR, pc.XRSPACE_LOCALFLOOR, {
            callback: (err) => {
              if (err)
                PlayCanvasApp.message(
                  "WebXR Immersive AR failed to start: " +
                  err.message
                );
            },
          });
        }
        else {
          PlayCanvasApp.message("Immersive AR is not available");
        }

        console.log(this._app.xr);
      };

      this._app.mouse.on("mousedown", () => {
        if (!this._app.xr.active) activate();
      });

      if (this._app.touch) {
        this._app.touch.on("touchend", (evt) => {
          if (!this._app.xr.active) {
            // if not in AR, activate
            activate();
          }
          else {
            // otherwise reset camera
            this._camera.camera.endXr();
          }

          evt.event.preventDefault();
          evt.event.stopPropagation();
        });
      }

      // end session by keyboard ESC
      this._app.keyboard.on("keydown", (evt) => {
        if (evt.key === pc.KEY_ESCAPE && this._app.xr.active) {
          this._app.xr.end();
        }
      });

      this._app.xr.on("start", () => {
        PlayCanvasApp.message("Immersive AR session has started");
      });

      this._app.xr.on("end", () => {
        PlayCanvasApp.message("Immersive AR session has ended");
      });

      this._app.xr.on("available:" + pc.XRTYPE_AR, (available) => {
        PlayCanvasApp.message(
          "Immersive AR is " + (available ? "available" : "unavailable")
        );
      });

      this._app.xr.on("update", (xrFrame) => {
        console.log("XR Update");
        console.log(xrFrame);
        console.log(this._app.xr._referenceSpace);
        const pose  = xrFrame.getViewerPose(this._app.xr._referenceSpace);
        console.log(pose);
      });

      if (!this._app.xr.isAvailable(pc.XRTYPE_AR)) {
        PlayCanvasApp.message("Immersive AR is not available");
      }
    } else {
      PlayCanvasApp.message("WebXR is not supported");
    }
  }

  static message(msg) {
    let el = document.querySelector(".message");
    if (!el) {
        el = document.createElement("div");
        el.classList.add("message");
        document.body.append(el);
    }
    el.textContent = msg;
  }
}
