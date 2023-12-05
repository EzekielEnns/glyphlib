import { init,render,addLayer,getLayer } from "./lib";

(async () => {
    /**
     * @type {HTMLCanvasElement}
     */
    let canvas = document.getElementById("canvas") as HTMLCanvasElement
    if (!canvas) {
        throw new Error("no canvas")
    }
    await init(canvas)
    addLayer({params:{
        columns: 10,
        rows:10,
        start:{x:-1,y:1},
        end:{x:1,y:-1},
    }})

    let l1 = getLayer(0)
    l1.setQuadTex({c:2,r:2},"1")

    
    requestAnimationFrame(renderLoop);
})()

function renderLoop() {
    render()
    requestAnimationFrame(renderLoop)
}
