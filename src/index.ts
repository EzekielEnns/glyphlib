//TODO rotate on loop
//move tirangle around
//change texture
const vertShaderSrc = `#version 300 es
//precision mediump float;
layout(location=0) in vec4 aPos;
layout(location=1) in vec2 aTexCoord;
uniform mat2 uRot;

out vec2 vTexCoord;
void main() {
    gl_Position = vec4((aPos.xy * uRot),aPos.zw);
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

const data = new Float32Array([
  -0.5, -0.5,   0, 0, 
     0,  0.5,   0.5, 1, 
   0.5, -0.5,    1, 0,
]);


//temparay texture
const pixels = new Uint8Array([
  255, 255, 255, 230, 25, 75, 60, 180, 75, 255, 225, 25, 67, 99, 216, 245, 130,
  49, 145, 30, 180, 70, 240, 240, 240, 50, 230, 188, 246, 12, 250, 190, 190, 0,
  128, 128, 230, 190, 255, 154, 99, 36, 255, 250, 200, 0, 0, 0,
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
function bindBuffers() {
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
  gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer( 1, 2, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 8);
  gl.enableVertexAttribArray(1);
  gl.bindVertexArray(null);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, 4, 4, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  gl.generateMipmap(gl.TEXTURE_2D);
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

  //so unfirom should only be updated once in a render loop
  let rad = (deg * Math.PI) / 180;
  const rotLocal = gl.getUniformLocation(prog, "uRot");
  gl.uniformMatrix2fv(
    rotLocal,
    false,
    new Float32Array([
      Math.cos(rad),
      Math.sin(rad),
      -1 * Math.sin(rad),
      Math.cos(rad),
    ])
  );

  // Issue draw calls to render objects
  gl.bindVertexArray(vao1); //setting up vao for objects
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindVertexArray(null);
  //for other do another round

  //--- setup for next render
  deg++;
  // Request the next frame
  requestAnimationFrame(render);
}
init();
bindShaders(vertShaderSrc, fragShaderSrc);
bindBuffers()
requestAnimationFrame(render);
