import { load } from "opentype.js";
import { genAtlas } from "./texture";
// TODO print both verties while mapped
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
const data = new Float32Array([
    -1,1,
    -1,0,
     0,0,

    -1,1,
     0,1,
     0,0,

    0,1,
    1,1,
    1,0,
    0,1,
    0,0,
    1,1
]);



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
  vao1 = gl.createVertexArray();
  gl.bindVertexArray(vao1);

  const buff = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buff);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  //stride means the postion for the next vertex so here we have 4 data points each 4 bytes
  //we read from offset 0 here 2 elements
  gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const texCordData = new Float32Array(2*4*6)
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
//some how missing how to render both at once 
  texCordData.set(atlas['h'],0)

  texCordData.set(atlas['i'],Float32Array.BYTES_PER_ELEMENT*6)
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
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArray(null);
  //for other do another round

  //--- setup for next render
  deg++;
  // Request the next frame
  requestAnimationFrame(render);
}

(async () => {
    const {img,atlas} = await genAtlas("monogram.ttf")
    init();
    bindShaders(vertShaderSrc, fragShaderSrc);
    bindBuffers(img,atlas )
    requestAnimationFrame(render);
})()

const texCoorData = new Float32Array(2*4)

function bindTex(img:ImageData) {
    
}
