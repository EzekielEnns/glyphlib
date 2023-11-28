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
//const data = createGrid(800,800,10,10,[-1,-1])
const _ = new Float32Array([
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



const columns = 2;
const rows = 5;
const vertCount = rows*columns
const data = createGrid(800,800,columns,rows,[-1,1])
var gl: WebGL2RenderingContext | null;
var cns: HTMLCanvasElement | null;
var prog: WebGLProgram | null;
//TODO look into how vaos work
//tried to use a vao for different attribes for the same vertex!!!
//thats not what they are for explain why
var vao1: WebGLVertexArrayObject | null;
function init() {
  cns = document.getElementById("canvas") as HTMLCanvasElement;
  gl = cns.getContext("webgl2");
  if (!gl) {
    throw Error("no webgl");
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
}


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

  const texCordData = new Float32Array(2*6*vertCount)
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
    for (let i=0; i<vertCount; i++){
      texCordData.set(atlas['.'],i*12)
    }
  
 // texCordData.set(atlas['.'],0)
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
  gl.drawArrays(gl.TRIANGLES, 0, 6*vertCount);
  gl.bindVertexArray(null);
  //for other do another round

  //--- setup for next render
  deg++;
  // Request the next frame
  requestAnimationFrame(render);
}

(async () => {
    const {img,atlas} = await genAtlas("monogram.ttf")
    console.log(createGrid(800,800,2,2,[-1,1]));
    console.log(data);
    init();
    bindShaders(vertShaderSrc, fragShaderSrc);
    bindBuffers(img,atlas )
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
    //TODO set programaixally
    //dimenstions for canvas
    let W = 800
    let H = 800
    if (w>W || h>H) {
        throw Error("box will not fit in canvas")
    }
    console.log("Cvs:",W,H,"Box:",w,h,"Dim:",c,r,"Str:",start)
    let current_Row = 0;
    let verts = new Float32Array(c*r*12)    //12 verties needed 
    //grid is a 4 quad cartison plane
    /*
        -1,1    0,1     1,1
                 0
        -1,-1           1,-1
    so if the canvas is 800x800 (WxH)
        we need to take the column size 
    */
    let [stepX,stepY] = [(w/c)/(W/2),(h/r)/(H/2)]
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




/*
drawArrays vs drawElements
    I will most likely use draw elements
    https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/177f83c4be6c6e03c7fe620b0486081626503067/06.drawElements.js#L98C1-L105C74
    https://webglfundamentals.org/webgl/lessons/webgl-indexed-vertices.html
    animations
https://chat.openai.com/share/4a7f0d72-568b-4f85-835a-dcf5a2200dd7
*/
