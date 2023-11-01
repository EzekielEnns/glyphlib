import { load } from 'opentype.js'
/*

two things this part can do 
1) generate a bitmap image
2) generate a map of the image

156 x 216
Texture coord system
0,1         1,1


0,0         1,0 
*/
interface AtlasMap {
    [glpyh:string]: Array<number>
}

interface Dim{
    w:number,
    h:number
}

//TODO follow a array/itter passeed to it
function genMap({w:iW,h:iH}:Dim,{w:gW,h:gH}:Dim,iter:Array<string>):AtlasMap{
    let aMap:AtlasMap = {}
    let col = iW/gW
    let row = iH/gH
    for (let i=0; i<iter.length; i++){
        let c = (i%col)
        let r = Math.floor(i/col % row)
        let left = c*gW/iW
        let top = 1-(r*gH)/iH
        let right = (c+1)*gW/iW
        let bottom = 1-((r+1)*gH)-iH
        aMap[iter[i]] = [
            left,top,
            right,top,
            left,bottom,
            right,bottom
        ]
        
    }
    return aMap
}

export async function genAtlas(f:string,size:number):Promise<{img:ImageData, atlas:AtlasMap}> {
    const columns = 26; 
    let row = 0;
    const font = await load(f)
    const bitmap = document.createElement('canvas')
    const ctx = bitmap.getContext('2d')
    if (!ctx) {
        throw new Error()
    }
    let y = 100
    let x = 0
    for (let i = 0; i< font.numGlyphs; i++ ){
        let g = font.glyphs.get(i)
        let p = g.getPath(x,100)
        if (x == columns-1){
           row++ 
        }
    }
    let g = font.charToGlyph("h")
    g.draw(ctx,0,33) //33 for 72 for hieght
    g = font.charToGlyph("i")
    g.draw(ctx,0,66)
    g = font.charToGlyph("1")
    g.draw(ctx,22,66) //22 for 72 gives me exact
    //spacing of 5 for 12
    //spacing of 25 for 72
    //ratio of 6:5
    //meaning fontsize * 6, spacing * 5
    var image = new Image()
    image.src =bitmap.toDataURL()
    document.write(image.outerHTML)
    //TODO     var imageData = context.getImageData(character.x, character.y, character.width, character.height);
    return {img:{} as ImageData,atlas:{}}
}

