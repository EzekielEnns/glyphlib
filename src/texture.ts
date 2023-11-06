import { load } from 'opentype.js'
/*
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

export async function genAtlas(f:string,size=72):Promise<{img:ImageData, atlas:AtlasMap}> {
    const columns = 26; //26 cuase i felt like it (can be any value)
    let aMap:AtlasMap = {}
    let row = 1;
    const font = await load(f)
    let rowStep = font.ascender/font.unitsPerEm * size; //top
    let colStep = font.getAdvanceWidth("A",size); 
    const bitmap = document.createElement('canvas')
    bitmap.width = columns*colStep;//Math.ceil(121/26)*40 
    bitmap.height = Math.ceil(font.numGlyphs/columns)*rowStep
    const ctx = bitmap.getContext('2d')
    if (!ctx) {
        throw new Error()
    }
    for (let i = 0; i< font.numGlyphs; i++ ){
        if (i!=0 && i % columns == 0){
           row++ 
        }
        let y = rowStep*(row)
        let x = (i%columns)*colStep//25
        console.log(x,",",y)
        let g = font.glyphs.get(i)
        g.draw(ctx,x,y)
        if (g.unicode) {
            /*
                you have to record them from the top,
                not the middle point in which they started from
                i.e. first one is 
                0,1,
                x+colStep/h , 1
                x
            */
            //note this only gets the first row!
            let left = x/bitmap.width;
            let right = (x+colStep)/bitmap.width;
            let top = 1-(rowStep*(row-1)/bitmap.height)
            let bottom = 1-(y/bitmap.height)
            aMap[String.fromCharCode(g.unicode)] = [
                left,top,
                left,bottom,
                right,bottom,

                left,top,
                right,top,
                right,bottom
            ]
        }
    }
    console.log(aMap["!"])
    return {img:ctx.getImageData(0,0,bitmap.width,bitmap.height),atlas:aMap}
}

