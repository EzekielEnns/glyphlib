/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export function init(canvas: HTMLCanvasElement, filename: string): Promise<void>;
/**
 * @param {Object} [options]
 * @param {Quad|GridDef} [options.params]
 * @param {number} [length=1]
 */
export function addLayer(options?: {
    params?: Quad | {
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
        rows: number;
        columns: number;
        noFill: boolean;
    };
}, length?: number): void;
/**
 * @param {number} index
 * @returns {Layer}
 */
export function getLayer(index: number): Layer;
export function render(): void;
export type Atlas = {
    [x: string]: Float32Array;
};
/**
 * this class is a math helper to deal with quads
 * please note quads are not optimized, they are 12 floats instead
 * of buffer elements
 */
declare class Quad {
    /**
     * @param {Float32Array} values
     */
    constructor(values: Float32Array);
    get width(): number;
    get height(): number;
    /**
     * adds the differnce between it and a full translation in the direction of
     * normalized coordaninates, returns self
     * @param {Coord} dir - normalized coordaninates orgin is center of quad
     * @param {number} [scale]
     * @returns {Quad}
     */
    step(dir: {
        x: number;
        y: number;
    }, scale?: number): Quad;
    /**
     *@param {Quad} target
     *@param {number} [scale=1]
     *@returns {Quad}
     */
    diff(target: Quad, scale?: number): Quad;
    /**
     * returns a quad with all points scaled to a factor
     *
     * @returns {Quad}
     */
    scale(factor: any): Quad;
    /**
     * @returns {Float32Array}
     */
    get values(): Float32Array;
    #private;
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
declare class Layer {
    /**
     * this enum is for navigating values inside the buffers array
     * this enables lib users to either add or modify how
     * a layer gets initilized, great for experimenting
     * @readonly
     * @enum {number}
     */
    static readonly bufferEnum: {
        VERTICES: number;
        TEXS: number;
        COLORS: number;
    };
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
    static CreateVerticesGrid({ rows, columns, start, end }: {
        rows: number;
        columns: number;
        start: {
            x: number;
            y: number;
        };
        end: {
            x: number;
            y: number;
        };
    }): Float32Array;
    /**
     */
    /**
     * @typedef {{x:number,y:number}} Coord
     * @typedef {{start:Coord,end:Coord,rows:number,columns:number,noFill:boolean}} GridDef
     * @param {WebGL2RenderingContext} gl
     * @param {Object} [options]
     * @param {Quad|GridDef} [options.params]
     * @param {number} [length=1]
     */
    constructor(gl: WebGL2RenderingContext, options?: {
        params?: Quad | {
            start: {
                x: number;
                y: number;
            };
            end: {
                x: number;
                y: number;
            };
            rows: number;
            columns: number;
            noFill: boolean;
        };
    }, length?: number);
    /**
     * @type {Array<Float32Array>}
     */
    data: Array<Float32Array>;
    /**
     * @type {WebGLBuffer} - 0 is vertex, 1 is te
     */
    buffers: WebGLBuffer;
    /**
     * @type {WebGLVertexArrayObject}
     */
    vao: WebGLVertexArrayObject;
    /**
     * @param {WebGL2RenderingContext} gl
     * renders vao/layer onto webgl context
     */
    render(gl: WebGL2RenderingContext): void;
    /**
     * @typedef {number|{c:number,r:number}} Index - either direct or grid index c,r
     */
    /**
     * @param {Index} index
     * @returns {Quad}
     */
    getCell(index: number | {
        c: number;
        r: number;
    }): Quad;
    /**
     *  this function chunks up the buffer data into quads
     *  right now quads are 6 points/ 12 floats
     *  @param {Index} index - location for quad
     *  @returns {Quad}
     */
    getQuad(index: number | {
        c: number;
        r: number;
    }): Quad;
    /**
     * @param {Index} index - location for quad
     * @param {Quad} value
     */
    setQuad(index: number | {
        c: number;
        r: number;
    }, value: Quad): void;
    /**
     *  @param {Index} index - location for quad
     *  @param {string} value - assumes atlas value
     */
    setQuadTex(index: number | {
        c: number;
        r: number;
    }, value: string): void;
    /**
     *  @param {Index} index - location for quad
     *  @param {Float32Array} color - rgb 1-0
     */
    setQuadColor(index: number | {
        c: number;
        r: number;
    }, color: Float32Array): void;
    /**
     * @param {Index} index
     * @returns {number}
     */
    getIndex(index: number | {
        c: number;
        r: number;
    }): number;
    #private;
}
export {};
//# sourceMappingURL=lib.d.ts.map