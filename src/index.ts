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
    l2.setQuadTex(0,"A")
    let q1 = l2.getCell({c:9,r:9})
    l2.setQuad(0,q1)
    let orig = new Float32Array(q1.values)
    let test =  q1.diff(l2.getCell({c:0,r:0}),0.01)    
    l2.setQuad(0,q1)
    orig.forEach((v,i)=>{if (v != test.values[i]){
        console.log(false)
        return}
    }) 

    //green
    l2.setQuadColor(0,new Float32Array([
        0.0,
        0.0,
        1.0,
        1.0
    ]))


    
    requestAnimationFrame(renderLoop);
})()
var alpha = 1.0
function renderLoop() {
    render()
    let l1 = getLayer(1)
    let q1 = l1.getQuad(0)
    let l0 = getLayer(0)
    l0.setQuadColor({c:0,r:0},new Float32Array([0,0,0,alpha]))
    l1.setQuad(0,q1.diff(l1.getCell({c:0,r:0}),0.01))
    alpha = alpha-0.01
    if (alpha <= 0)
        alpha = 1
   requestAnimationFrame(renderLoop)

}
