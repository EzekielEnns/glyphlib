//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
//https://jsdoc.app/howto-es2015-classes
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes
//
//TODO deal with resizing SOME where 

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
     * @type {HTMLCanvasElement}
     */
    canvas 

    constructor(gl,canvas) {
        //setting up webgl and the canvas
    }

    /**
     * add a layer 
     * @param {number|[number,number]} size 
     * @param {[number,number]} [start]
     * @param {[number,number]} [end]
     * @param {Array<Float32Array>} [bufferData]
     */
    add(size,[height,width],bufferData) {
        //calls the constructor for layer
        //and lets it do is business
    }

    /**
     * calls all layers render functions
     */
    render() {

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
                //set quads/step
            }
        } 
        else if(options?.params?.rows) {
            //setup grid
            ////TODO make CreateVerticesGrid deconstruct
            let grid = Layer.CreateVerticesGrid(options.params)
            this.#length = options.params.rows * options.params.columns
            this.data.push(grid) //the two is for the two floats that makeup a point
            this.data.push(new Float32Array(grid.length)) //map atlas points to vertex points
            this.data.push(new Float32Array(6*length*3)) //colors is a vec3
        }
        /*
            bind buffers,
            initlize everything for vao
            setup all the things for this layer
            
            a layer is its buffers and everything in the vao
            
            
            note this would call create vertex grid
        */
        // let vertexSize = is6 ? 6:1
        // //layer is a given length
        // if (typeof size == "number") {
        //     this.#length = size
        //     this.data.push(new Float32Array(vertexSize*2*size)) //the two is for the two floats that makeup a point
        //     this.data.push(new Float32Array(vertexSize*2*size)) //map atlas points to vertex points
        //     this.data.push(new Float32Array(vertexSize*size*3)) //colors is a vec3
        // }
        // //layer is a set of quads
        // else {
        //     [this.#rows,this.#columns] = size
        //     this.#length = this.#columns*this.#rows
        //     let grid = Layer.CreateVerticesGrid(this.#rows,this.#columns,start,end)
        //     this.data.push(grid)
        //     this.data.push(new Float32Array(vertexSize*2*this.#length))
        //     this.data.push(new Float32Array(vertexSize*this.#length*3))
        // }
        //
        // //create gl stuf
        // //create vao
        // this.vao = gl.createVertexArray()
        // //setup buffers

    }

    /**
     * renders vao/layer onto webgl context
     */
    render(gl) {

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
        //TODO determin index
        return new Quad(this.data[Layer.bufferEnum.VERTICES]
            .slice(index,index+12));
    }
    
    /**
     *  @param {Index} index - location for quad
     *  @param {string} value - assumes atlas value
     */
    setQuadTex(index,value) {

    }

    /**
     *  @param {Index} index - location for quad
     *  @param {Float32Array} color - rgb 1-0
     */
    setQuadColor(index, color) {
    }

    //TODO future function could be getPoint(index)
    //essentally quad just deals with data arrays as quads

    //TODO indexing function for quads and for points

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
        let [startX,startY] = start

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

    /**
     * adds the differnce between it and a full translation in the direction of
     * normalized coordaninates, returns self
     * @param {Coord} dir - normalized coordaninates orgin is center of quad
     * @param {number} [scale]
     * @returns {Quad}
     */
    step(dir,scale){
        //TODO add check if quad is in bounds of webgl coord
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
        //TODO check if in bounds of game
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


//TODO setup global state
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
