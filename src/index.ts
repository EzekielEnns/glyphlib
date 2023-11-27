import { AtlasMap, genAtlas } from "./texture";
//TODO add mapping to columns/rows 
//TODO add animation step inbetween tixks 
const vertShaderSrc = `#version 300 es
//precision mediump float;
layout(location=0) in vec4 aPos;
layout(location=1) in vec2 aTexCoord;

out vec2 vTexCoord;
void main() {
    gl_Position = aPos;
    vTexCoord = aTexCoord;
}
`;

const fragShaderSrc = `#version 300 es
precision mediump float;

in vec2 vTexCoord;

uniform sampler2D uSampler;

out vec4 fragColor;

void main() {
    fragColor = texture(uSampler,vTexCoord);
}
`;
/*
-1,1        1,1

-1,-1       1,-1
*/
const data = createGrid(800,800,10,10,[-1,-1])
const test = new Float32Array([
    -1,1,
    -1,0,
     0,0,

    -1,1,
     0,1,
     0,0,

    0,1, //note other varitions of this will roate the texture
    0,0,
    1,0,

    0,1,
    1,1,
    1,0,

    
    -1,0,
    -1,-1,
    0,-1,

    -1,0,
    0,0,
    0,-1,
    
    0,0,
    0,-1,
    1,-1,

    0,0,
    1,0,
    1,-1,
]);



var prog: WebGLProgram | null;
var vao1: WebGLVertexArrayObject | null;

var cns = document.getElementById("canvas") as HTMLCanvasElement;
var gl = cns.getContext("webgl2");
if (!gl || !cns ) {
    throw Error("no webgl");
}

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

//TODO make more generic
function bindShaders(vSrc: string, fSrc: string) {
  if (!gl) {
    throw Error("no webgl");
  }
  //create and use program
  prog = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!prog || !vertexShader || !fragShader) {
    throw Error("bad prog no shader");
  }
  gl.shaderSource(vertexShader, vSrc);
  gl.compileShader(vertexShader);
  gl.attachShader(prog, vertexShader);
  gl.shaderSource(fragShader, fSrc);
  gl.compileShader(fragShader);
  gl.attachShader(prog, fragShader);

  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragShader));
  }
  gl.useProgram(prog);
}
function bindBuffers(img:ImageData, atlas:any) {
  if (!gl || !cns || !prog) {
    throw Error("no webgl");
  }
  //TODO draw elements Swap to draw elements
  vao1 = gl.createVertexArray();
  gl.bindVertexArray(vao1);

  const buff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buff);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  //stride means the postion for the next vertex so here we have 4 data points each 4 bytes
  //we read from offset 0 here 2 elements
  gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const texCordData = new Float32Array(2*6*100)
  const texCordBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCordBuf)
  gl.bufferData(gl.ARRAY_BUFFER,texCordData.byteLength, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer( 1, 2, gl.FLOAT, false, 0,0);
  gl.enableVertexAttribArray(1);
  gl.bindVertexArray(null);

/*
0,1         1,1


0,0         1,0 
*/
    // for (let i=0; i<100; i++){
    //   texCordData.set(atlas['.'],i*12)
    // }
  
  texCordData.set(atlas['.'],0)
  gl.bufferSubData(gl.ARRAY_BUFFER,0,texCordData)
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
}

var deg = 0.1;
function render() {
  if (!gl || !cns || !prog) {
    throw Error("no webgl");
  }

  //---- handle input
  //handleInput();

  //---- update sim

  //---- Clear the canvas FIXME why is my rendering not in center
  cns.width = cns.clientWidth;
  cns.height = cns.clientHeight;
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //----- Set view and projection matrices (for 3D graphics)

  //----- Bind shaders and buffers

  // Issue draw calls to render objects
  gl.bindVertexArray(vao1); //setting up vao for objects
  gl.drawArrays(gl.TRIANGLES, 0, 6*100);
  gl.bindVertexArray(null);
  //for other do another round

  //--- setup for next render
  deg++;
  // Request the next frame
  requestAnimationFrame(render);
}

var atlas: AtlasMap
(async () => {
    const obj = await genAtlas("monogram.ttf")
    atlas = obj.atlas
    console.log(createGrid(gl.canvas.width??0,gl.canvas.height??0,10,10,[-1,1]));
     bindShaders(vertShaderSrc, fragShaderSrc);
    bindBuffers(obj.img,atlas )
    requestAnimationFrame(render);
})()

/*
-1,1        1,1

-1,-1       1,-1

number of points = (2c) * (r+1)
so we itter over that many points 
we can itter over columns 

for i<(2col)*(row+1)
   r++
   c = i % 2col
   y = 1-(start-r*step/h)
   x = start+c*step/w
   //adding point to vertexts 
   v[2i] = x; v[2i+1] = y
   //adding point to vertexts

how will we deal with the indices?
thinking divde indices into sectors and map i into indices
*/

function createGrid(w:number,h:number,r:number,c:number,start:Array<number>) {
    let W = gl?.canvas?.width??800
    let H = gl?.canvas?.height??800
    if (w>W || h>H) {
        console.log(W)
        console.log(H)
        throw Error("box will not fit in canvas")
    }

    let current_Row = 0;
    let verts = new Float32Array(c*r*12)    //12 verties needed 
    //-1,1 -> 1,1 therefor step = w*c /(W/2) -> 2*w /(c*W)
    let [stepX,stepY] = [2*w/(c*W),2*h/(r*H)]
    console.log(stepX,"STEPX")
    console.log(stepY,"STEPY")
    let [startX,startY] = start

    for (let i = 0; i <r*c; i++){
        let current_Col = i%c
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

/*
        0       width/2
-1,1       1,1

1 = width/2
1 = height/2
*/



function generateVerteis(r:number,c:number, atlas:AtlasMap){
    let verts = new Float32Array(c*r*8) //8 floats per vertex
    let indic = new Uint16Array(c*r*6)  //6 index's to use per quad
    let tex = new Float32Array(c*r*6*2) //temp 
    let row = 0;
    let step = [2/c,2/r] //2width/column/width = 1/column why dose math like this get me pumped 
    //so the two here comes from the processes of traversing the cartisain plane
    //since we traveling over 2 units (-1 -> 1) we need the two there to make sure it maps right
    //god dam why do i love this typeoh math so much

    let start = [-1,-1] //x,y
    for (let i=0; i<r*c; i++){
        if (i!=0 && i % c== 0){
           row++ 
        }
        //we start in -1,-1
        let left = start[0]+(i % c * step[0]);
        let right = left+step[0];
        let top = start[1]+(row*step[1]);
        let bot = top+step[1]; //fuuuucckkk math is rad

        verts.set([
            left, top,
            right,top,
            left,bot,
            right,top,
        ],i*8)
        
        //TODO fix this is wrong since we have to section off 6 vertexs
        //note this maybe wrong have to check
        indic.set([
           i, i+1, i+2,
           i+2, i+1, i+3,
        ],i*6)
        //TODO remove when testing done
        tex.set(atlas['.'],i*6*2) //6 pairs(2') of floats 
    }
    return {verts,indic}
}

/*
drawArrays vs drawElements
    I will most likely use draw elements
    https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/177f83c4be6c6e03c7fe620b0486081626503067/06.drawElements.js#L98C1-L105C74
    https://webglfundamentals.org/webgl/lessons/webgl-indexed-vertices.html
    animations
https://chat.openai.com/share/4a7f0d72-568b-4f85-835a-dcf5a2200dd7
*/
