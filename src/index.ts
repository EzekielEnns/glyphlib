//good source 
//https://dannywoodz.wordpress.com/2015/10/14/webgl-from-scratch-updating-textures/
//TODO make api for updating grid
    //using current setup on line: ~129
//TODO add color uniform 
    //https://github.com/EzekielEnns/glyphlib/blob/a9d8525b12552d50da8afad328f66e624af892a6/src/index.ts
//TODO add smooth transtion
//TODO deal with rescale
import { AtlasMap, genAtlas } from "./texture";

const vertShaderSrc = `#version 300 es
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

const fragShaderSrc = `#version 300 es
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

//IMPROVE scaling for atlas
const columns = 25;
const rows = 25;
const vertCount = rows*columns
var data = createGrid(800,800,columns,rows,[-1,1])
var texCordData = new Float32Array(2*6*vertCount)
var prog: WebGLProgram | null;
var cns = document.getElementById("canvas") as HTMLCanvasElement;
var gl = cns.getContext("webgl2");
if (!gl) {
    throw Error("no webgl");
}
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
var texCordBuf = gl?.createBuffer()
var posCordBuf = gl?.createBuffer()
var vao1: WebGLVertexArrayObject | null;

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
function bindBuffers(img:ImageData) {
  if (!gl || !cns || !prog) {
    throw Error("no webgl");
  }
  //TODO draw elements Swap to draw elements
  vao1 = gl.createVertexArray();
  gl.bindVertexArray(vao1);

  gl.bindBuffer(gl.ARRAY_BUFFER, posCordBuf);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  //stride means the postion for the next vertex so here we have 4 data points each 4 bytes
  //we read from offset 0 here 2 elements
  gl.vertexAttribPointer( 0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  //const texCordBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texCordBuf)
  gl.bufferData(gl.ARRAY_BUFFER,texCordData.byteLength, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer( 1, 2, gl.FLOAT, false, 0,0);
  gl.enableVertexAttribArray(1);
    
  //cant put atrrib here first
  //cause of the gl.subData call?

  //IMPROVE Texture arrays
  gl.bufferSubData(gl.ARRAY_BUFFER,0,texCordData)
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, img.width, img.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)

  //TODO abstarct away
  //6 verties per thing,3 floats per vertex
  // for (let i =0; i<-1; i++){
  //     color.set([1.0,0.0,0.0],i*3)//white
  // }
  //gl.bufferSubData(gl.ARRAY_BUFFER,0,color)
  var color = new Float32Array(vertCount*6*3);
  color.fill(0.0)
  for (let i =0; i<6; i++){
      color.set([1.0,0.0,0.0],i*3)//white
  }
  //TODO find out why order matters here
  var colorBuf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER,colorBuf) 
  gl.bufferData(gl.ARRAY_BUFFER,color.byteLength,gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer( 2, 3, gl.FLOAT, false, 0,0);
  gl.enableVertexAttribArray(2);

  gl.bindVertexArray(null);

  gl.bufferSubData(gl.ARRAY_BUFFER,0,color)
}

//var deg = 0.1;
function render(atlas:AtlasMap,img:ImageData) {
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

  //----- update buffers
  texCordData.set(atlas['@'],
                  Math.floor(Math.random()*rows*columns)
              *12)
  gl.bindBuffer(gl.ARRAY_BUFFER, texCordBuf)
  gl.bufferData(gl.ARRAY_BUFFER,texCordData.byteLength, gl.DYNAMIC_DRAW)
  gl.bufferSubData(gl.ARRAY_BUFFER,0,texCordData)

  //---- Issue draw calls
  gl.bindVertexArray(vao1); 
  gl.drawArrays(gl.TRIANGLES, 0, 6*vertCount);
  gl.bindVertexArray(null);     //unbind 
  //for other do another round

  //--- setup for next render
  //deg++;
  // Request the next frame
  requestAnimationFrame(()=>render(atlas,img));
}

(async () => {
    const {img,atlas} = await genAtlas("monogram.ttf")
    for (let i=0; i<vertCount; i++){
        texCordData.set(atlas['.'],i*12)
    }
    bindShaders(vertShaderSrc, fragShaderSrc);
    bindBuffers(img)
    requestAnimationFrame(()=>render(atlas,img));
})()

//note that indexing starts at 0,0 for rows and column
function drawCell(r:number,c:number,C:number,value:string,atlas:AtlasMap){
    let i = r*C+c
    texCordData.set(atlas[value],i*12)
}

/*
-1,1        1,1

-1,-1       1,-1
*/

/*
This function generates a sized grid based on
the size of the webgl context it is rendering to
main issues here:
    not checking for edge cases 
        - box being out of bounds 
        - box being out of bounds with start pos
    IDea:
        take ratio of w and h and multiply W and H
        scale = Math.min(w/W,h/H) 
        w = w*scale
        h = h*scale
    I need to add starting pos into this as well

    IMPROVE use draw elements
    requires indecies array to be outputed as well

    note that r and c are how we get resolution

*/
function createGrid(w:number,h:number,r:number,c:number,start:Array<number>) {
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

