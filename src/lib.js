//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties
//https://jsdoc.app/howto-es2015-classes
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes


class Layers {
    //holds a bunch of layers
    /**
     * @type {Array<Layer>}
     */
    #layers = []

    constructor() {
    }

    /**
     * add a layer 
     * @param {number|[number,number]} size 
     * @param {[number,number]} [dimentions]
     * @param {WebGLProgram} [program=]
     */
    add(size,[height,width],program) {
        if(!program) {
            //set default gl program
        }
        //array addressed layer 
        if (typeof size == "number") {

        } 
        //grid based addressed layer 
        else {
            //create grid  using create git function
        }
    }

    /**
     * renders all layers using vao's by default
     */
    render() {

    }

    /**
     * @param {number} index - index of layer 
     */
    get(index) {
        return this.#layers[index]
    }

    //TODO modify(index, (gl)=>{})
    //TODO setup
    //TODO render(index)
}

/**
 * @class
 * @property {Float32Array} texData
 * @private
 */
class Layer {
    /**
     * @type {Float32Array}
     * @private
     */
    #texData 
    #colorData

}



class Quad {
    #values = new Float32Array(6*2) //6 points (triangles) 2 values per point
    //use slice and set 
    
}
