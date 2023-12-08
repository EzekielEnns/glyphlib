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
        noFill: false
    }})

    let l1 = getLayer(0)
    l1.setQuadTex({c:0,r:0},"-")
    addLayer({params:{
        columns: 10,
        rows:10,
        start:{x:-1,y:1},
        end:{x:1,y:-1},
        noFill:true
    }})
    
    let l2 = getLayer(1)
    l2.setQuadTex(0,"1")
    l2.setQuad(0,l2.getCell({c:3,r:4}))
    //green
    l2.setQuadColor(0,new Float32Array([0,1.0,0.0]))

    
    requestAnimationFrame(renderLoop);
})()

function renderLoop() {
    render()
    requestAnimationFrame(renderLoop)
}
