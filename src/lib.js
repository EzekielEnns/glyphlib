//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
//https://jsdoc.app/howto-es2015-classes
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
//
//TODO deal with resizing SOME where 

import { genAtlas } from "./texture";

const vSrc = `#version 300 es
precision mediump float;
layout(location=0) in vec4 aPos;
layout(location=1) in vec2 aTexCoord;
layout(location=2) in vec3 aColor;

out vec2 vTexCoord;
out vec3 vColor;
void main() {
    gl_Position = aPos;
    vTexCoord = aTexCoord;
    vColor = aColor;
}
`;

//TODO make colors a vec4 for a value
const fSrc = `#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vColor;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
    vec4 texColor = texture(uSampler, vTexCoord);
    
    // Define the threshold for identifying black
    float threshold = 0.1; // Adjust this threshold as needed
    
    // Check if the pixel color is close to black
    if (texColor.r < threshold && texColor.g < threshold && texColor.b < threshold) {
        // Replace black with red color
        fragColor = vec4(0.5,0.5,0.5, texColor.a); // Red color (change as desired)
        fragColor = vec4(vColor, texColor.a); // Red color (change as desired)
    } else {
        fragColor = texColor;
    }
}
`;


/**
 * @typedef {Object.<string,Float32Array>} Atlas 
 * @type Atlas
 */
var ATLAS

/**
 * initalizeds the webgl contex, and sets up the whole rendering setup
 * it also holds the inital layers used for rendering each part onto the webgl context
 */
class Layers {
    /**
     * @type {Array<Layer>}
     */
    #layers = []

    /**
     * @type {WebGL2RenderingContext}
     */
    gl 



    /**
     * @param {ImageData} img 
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas,img) {

        //setting up webgl and the canvas
        let gl = canvas.getContext("webgl2");
    
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        //bind program TODO can be layer specific
        const prog = gl.createProgram();
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(vertexShader, vSrc);
        gl.compileShader(vertexShader);
        gl.attachShader(prog, vertexShader);
        gl.shaderSource(fragShader, fSrc);
        gl.compileShader(fragShader);
        gl.attachShader(prog, fragShader);

        gl.linkProgram(prog);
        gl.useProgram(prog);

        //bind texture TODO can be layer specific
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

        this.gl = gl
    }

    /**
     * add a layer 
     * @param {Object} [options]
     * @param {Quad|GridDef} [options.params]
     * @param {number} [length=1]
     */
    add(options,length) {
        this.#layers.push(new Layer(this.gl,options,length))
    }

    /**
     * calls all layers render functions
     */
    render() {

      // cns.width = cns.clientWidth;
      // cns.height = cns.clientHeight;
      this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
      this.#layers.forEach(l=>l.render(this.gl))
    }

    /**
     * @param {number} index - index of layer 
     */
    get(index) {
        return this.#layers[index]
    }

    //TODO support programs - gotta look into them first
    //TODO modify(index, (gl)=>{})
    //TODO setup(index,(gl)=>{})
}

/**
 * represents a grouping/layer of vertices and other buffers 
 * that get rendered by the layers object
 *
 * provides easy access to settinging and indexing parts of the 
 * buffer data
 *
 * handles rendering and general access to a layer
 */
class Layer {
    /**
     * @type {Array<Float32Array>} 
     */
    data = []

    /**
     * @type {WebGLBuffer} - 0 is vertex, 1 is te
     */
    buffers = []

    /**
     * @type {WebGLVertexArrayObject}
     */
    vao
    
    /**
     * @type {number}
     */
    #columns = 0;
    /**
     * @type {number}
     */
    #rows = 0;
    /**
     * @type {number}
     */
    #length = 0;

    /**
     * this enum is for navigating values inside the buffers array
     * this enables lib users to either add or modify how 
     * a layer gets initilized, great for experimenting 
     * @readonly
     * @enum {number}
     */
    static bufferEnum = {
        VERTICES: 0,
        TEXS: 1,
        COLORS: 2,
    }
    /**
     */

    /**
     * @typedef {{x:number,y:number}} Coord
     * @typedef {{start:Coord,end:Coord,rows:number,columns:number}} GridDef
     * @param {WebGL2RenderingContext} gl 
     * @param {Object} [options]
     * @param {Quad|GridDef} [options.params]
     * @param {number} [length=1]
     */
    constructor(gl,options,length) {
        length = length??1

        if (options instanceof Quad) {
            //add quads
            this.#length = length
            this.data.push(new Float32Array(6*2*length)) //the two is for the two floats that makeup a point
            this.data.push(new Float32Array(6*2*length)) //map atlas points to vertex points
            this.data.push(new Float32Array(6*length*3)) //colors is a vec3

            for (let i =0; i <6*length; i++){
                this.data[0].set(options.values,i*6)
                if (options.width > 1) {
                    options.step(0,1)
                } else {
                    options.step(1,0)
                }
                //no y over flow detected 
            }
        } 
        else if(options?.params?.rows) {
            //setup grid
            let grid = Layer.CreateVerticesGrid(options.params)
            this.#rows = options.params.rows
            this.#columns = options.params.columns

            this.#length = options.params.rows * options.params.columns
            this.data.push(grid) //the two is for the two floats that makeup a point
            this.data.push(new Float32Array(grid.length)) //map atlas points to vertex points
            this.data.push(new Float32Array(6*this.#length*3)) //colors is a vec3
        }

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao)
        this.buffers.push(gl.createBuffer())
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[Layer.bufferEnum.VERTICES])
        gl.bufferData(gl.ARRAY_BUFFER,this.data[Layer.bufferEnum.VERTICES],
            gl.STATIC_DRAW)
        gl.vertexAttribPointer(Layer.bufferEnum.VERTICES,2,gl.FLOAT,false,0,0)
        gl.enableVertexAttribArray(Layer.bufferEnum.VERTICES)
        
        this.buffers.push(gl.createBuffer())
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[Layer.bufferEnum.TEXS])
        gl.bufferData(gl.ARRAY_BUFFER,this.data[Layer.bufferEnum.TEXS],
            gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(Layer.bufferEnum.TEXS,2,gl.FLOAT,false,0,0)
        gl.enableVertexAttribArray(Layer.bufferEnum.TEXS)

        this.buffers.push(gl.createBuffer())
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[Layer.bufferEnum.COLORS])
        gl.bufferData(gl.ARRAY_BUFFER,this.data[Layer.bufferEnum.COLORS],
            gl.DYNAMIC_DRAW)
        gl.vertexAttribPointer(Layer.bufferEnum.COLORS,3,gl.FLOAT,false,0,0)
        gl.enableVertexAttribArray(Layer.bufferEnum.COLORS)

        gl.bindVertexArray(null);
    }

    /**
     * @param {WebGL2RenderingContext} gl 
     * renders vao/layer onto webgl context
     */
    render(gl) {
        for (const index in Layer.bufferEnum) {
            gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers[Layer.bufferEnum[index]])
            gl.bufferData(gl.ARRAY_BUFFER,this.data[Layer.bufferEnum[index]],
               index=="VERTICES"?gl.STATIC_DRAW:gl.DYNAMIC_DRAW)
        }

        gl.bindVertexArray(this.vao)
        gl.drawArrays(gl.TRIANGLES,0,6*this.#length)
        gl.bindVertexArray(null)
    }

    /**
     * @typedef {number|{c:number,r:number}} Index - either direct or grid index c,r
     */

    /**
     *  this function chunks up the buffer data into quads
     *  right now quads are 6 points/ 12 floats 
     *  @param {Index} index - location for quad
     *  @returns {Quad}
     */
    getQuad(index) {
        //FIXME get index
        return new Quad(this.data[Layer.bufferEnum.VERTICES]
            .slice(index,index+12));
    }
    
    /**
     *  @param {Index} index - location for quad
     *  @param {string} value - assumes atlas value
     */
    setQuadTex(index,value) {
        console.log(index)
        if (typeof index == "number") {
            this.data[Layer.bufferEnum.TEXS].set(ATLAS[value],index*12)
        } else {
            let i = index.r * this.#columns + index.c
            console.log(i)
            this.data[Layer.bufferEnum.TEXS].set(ATLAS[value],i*12)
        }
    }

    /**
     *  @param {Index} index - location for quad
     *  @param {Float32Array} color - rgb 1-0
     */
    setQuadColor(index, color) {
        if (index.r && index.c) {
            let i = index.r * this.#columns * index.c
            this.data[Layer.bufferEnum.COLORS].set(color,i*3)
        } else {
            this.data[Layer.bufferEnum.COLORS].set(color,index*3)
        }
    }

    /**
     * creates a unoptimized grid of vertices, these are quads
     * that overlap on the dimentions specifed, note start and end are normalized coords
     * @param {object} params
     * @param {number} params.rows 
     * @param {number} params.columns
     * @param {Coord} params.start - normalized 4 quadrent cartisan plane
     * @param {Coord} params.end - normalized 4 quadrent cartisan plan
     * @returns {Float32Array}
     */
    static CreateVerticesGrid({rows,columns,start,end}) {
        //TODO add check if start overlaps end
        let current_Row = 0;
        let verts = new Float32Array(columns*rows*12)
        let [stepX,stepY] = [
            Math.abs(end.x-start.x)/columns,
            Math.abs(end.y-start.y)/rows
        ]
        console.log(stepX,"STEPX")
        console.log(stepY,"STEPY")
        let {x:startX,y:startY} = start

        for (let i = 0; i <rows*columns; i++){
            let current_Col = i%columns
            if (i!=0 && current_Col == 0){
               current_Row++
            }
            
            let top = startY - current_Row*stepY
            let bottom = top - stepY
            let left = startX + current_Col*stepX
            let right = left + stepX

            verts.set([
                left,top,
                left,bottom,
                right,bottom,

                left,top,
                right,top,
                right,bottom
            ],i*12)
            
        }

        return verts
    }
}



/**
 * this class is a math helper to deal with quads
 * please note quads are not optimized, they are 12 floats instead
 * of buffer elements 
 */
class Quad {
    #values = new Float32Array(6*2) //6 points (triangles) 2 values per point
    //use slice and set 
    
    /**
     * @param {Float32Array} values 
     */
    constructor(values){
        this.#values = values
    }

    get width() {
        return this.#values[2] - this.#values[0]
    }
    
    get height() {
        return this.#values[1] - this.#values[5]
    }

    /**
     * adds the differnce between it and a full translation in the direction of
     * normalized coordaninates, returns self
     * @param {Coord} dir - normalized coordaninates orgin is center of quad
     * @param {number} [scale]
     * @returns {Quad}
     */
    step(dir,scale){
        //FIXME check if in bounds with webgl context
        //this is also bad
        scale = scale??1
        for (let i = 0; i<12;i+=2){
            this.#values[i] += this.#values[i]*scale*dir.x
            this.#values[i+1] += this.#values[i+1]*scale*dir.y
        }
        return this
    }

    /**
     * returns a quad with all points scaled to a factor 
     *
     * @returns {Quad}
     */
    scale(factor) {
        for (let i = 0; i<12;i+=2){
            this.#values[i] *= factor
        }
        return this
    }


    /**
     * @returns {Float32Array}
     */
    get values() {
        return this.#values
    }

    //TODO
    // add(q){ }
    // sub(q){ }
    // diff(q){ }
    
    
}




/**
 * @type {Layers}
 */
let layers;


/**
 * @param {HTMLCanvasElement} canvas 
 */
export async function init(canvas) {
    let {img,atlas} = await genAtlas("monogram.ttf")
    ATLAS = atlas
    layers = new Layers(canvas,img)
    console.log(layers)
}

/**
 * @param {Object} [options]
 * @param {Quad|GridDef} [options.params]
 * @param {number} [length=1]
 */
export function addLayer(options,length=1) {
    layers.add(options,length)
}

/**
 * @param {number} index 
 * @returns {Layer}
 */
export function getLayer(index){
    return layers.get(index)
}

export function render() {
    layers.render()
}


//FIXME setup global state
//how this will work is there will be functions that let you interface
//with these classes instead of dealing with there contruction directly
//https://chat.openai.com/share/20db033f-40af-42f9-b7e3-cb2aa85dfb33

// init()
//
// //layer 1 map
// addlayer({
// {
//             start:{x:-1,y:1},
//             end:{x:1,y:-1},
//             rows:10,columns:10
//     }
// })
//
//
// addlayer({
//     quad:getLayer(0).getQuad(0)
// },10)
//
// for i in range(10) {
//     this.vertices.set(quad.StepDirection("right").scale(i).data(),i*12)
// }
//
// addLayer({ points,buffers:[
//     [1,1,-1,1]
//     [1,1,1,1]
//     [1,1]
// ],program:someGlProg },10)
//
//
//
//
// renderLoop(){
//     let l1 = getLayer(1)
//     let l2 = getLayer(2)
//     for i,v in gameState {
//        l1.setTex(i,v) 
//     }
//
//     let pQuad =l2.getQuad(0)
//     pQuad.step({x:0,y:1},0.5)
//     l2.setQuad(0,pQuad)
//
//
// }
