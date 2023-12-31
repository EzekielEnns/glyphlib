
const vertShaderSrc = `#version 300 es
precision mediump float;
layout(location=0) in vec4 aPos;
layout(location=1) in vec2 aTexCoor;

out vec2 vTexCoord;
void main(){
    gl_Position = aPos;
    vTexCoord = aTexCoor;
}
`;

const fragShaderSrc = `#version 300 es
precision mediump float;

in vec2 vTexCoord;

uniform sampler2D uSampler;

out vec4 fragColor;
void main(){
    fragColor = texture(uSampler,vTexCoord);
}
`;

const vertexBufferData = new Float32Array([
  -0.9, -0.9, 
  0, 0.9, 
  -0.9, -0.9,
]);

const texCoordBufferData = new Float32Array([
    0, 0,
    -5,1,
    1, 0]);

const pixels = new Uint8Array([
  255, 255, 255,    230, 25, 75,     60, 180, 75,    255, 225, 25,
  67, 99, 216,       245, 130, 49,  145, 30, 180,    70, 240, 240,
  240, 50, 230,      188, 246, 12,  250, 190, 190, 0,
  128, 128, 230, 190, 255, 154, 99, 36, 255, 250, 200, 0, 0, 0,
]);

var gl: WebGL2RenderingContext | null;
var cns: HTMLCanvasElement | null;

function init() {
  cns = document.getElementById("canvas") as HTMLCanvasElement;
  gl = cns.getContext("webgl2");
  if (!gl) {
    return;
  }
}

//TODO make more generic
function bindShaders(vSrc: string, fSrc: string) {
  if (!gl) {
    return;
  }
  //create and use program
  const program = gl.createProgram();
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  if (!program || !vertexShader || !fragShader) {
    return;
  }
  gl.shaderSource(vertexShader, vSrc);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);
  gl.shaderSource(fragShader, fSrc);
  gl.compileShader(fragShader);
  gl.attachShader(program, fragShader);

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragShader));
  }
  gl.useProgram(program);
}

function bindBuffers() {
  if (!gl || !cns) {
    return;
  }
  //our 'texture'
  // const pixelBuffer = gl.createBuffer();
  // gl.bindBuffer(gl.PIXEL_UNPACK_BUFFER,pixelBuffer)
  // gl.bufferData(gl.PIXEL_UNPACK_BUFFER,pixels,gl.STATIC_DRAW)
  alert("hi")
  const vertextBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,vertextBuffer)
  gl.bufferData(gl.ARRAY_BUFFER,vertexBufferData,gl.STATIC_DRAW)

  gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0)
  gl.enableVertexAttribArray(0)

  const texCoorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,texCoorBuffer)
  gl.bufferData(gl.ARRAY_BUFFER,texCoordBufferData,gl.STATIC_DRAW)
  gl.vertexAttribPointer(1,2,gl.FLOAT,false,0,0)
  gl.enableVertexAttribArray(1)

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,texture)
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,4,4,0, gl.RGB, gl.UNSIGNED_BYTE, pixels)

  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST)

  //create buffer
  //bind buffer with created one to a certain webgl object
  //set buffer data
  //set vertext attribPointer
  //enable vertexAttrib
  
  // const textureSlot1 = 1;
  // gl.activeTexture(gl.TEXTURE0+textureSlot1)
  // const texture = gl.createTexture();
  // gl.bindTexture(gl.TEXTURE_2D, texture)
  // gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,4,4,0,gl.RGB,gl.UNSIGNED_BYTE,0)
  //
  // gl.generateMipmap(gl.TEXTURE_2D)

}

function render() {
  if (!gl || !cns) {
    return;
  }

  // Handle user input (e.g., keyboard or mouse events)
  //handleInput();

  // Update any dynamic data or variables
  //updateLogic();

  // Clear the canvas
  // cns.width = cns.clientWidth;
  // cns.height = cns.clientHeight;
  //gl.clearColor(0.08, 0.08, 0.08, 1.0);
  //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Set view and projection matrices (for 3D graphics)

  // Bind shaders and buffers
  // bindShadersAndBuffers();
  bindShaders(vertShaderSrc,fragShaderSrc);
  bindBuffers();

  // Issue draw calls to render objects
  gl.drawArrays(gl.TRIANGLES, 0,3);

  // Swap buffers if double buffering is used

  // Request the next frame
 // requestAnimationFrame(render);
}
//note start by doing requestAnimationFrame(render);
//init()
//requestAnimationFrame(render);
//render()
