import { load } from 'opentype.js'
/*
0,1         1,1


0,0         1,0 
*/
interface AtlasMap {
    [glpyh:string]: Array<number>
}

export async function genAtlas(f:string,size=72):Promise<{img:ImageData, atlas:AtlasMap}> {
    const columns = 26; //26 cuase i felt like it (can be any value)
    let aMap:AtlasMap = {}
    let row = 0;
    const font = await load(f)
    let rowStep= (font.ascender/font.unitsPerEm * size) + Math.abs((font.descender/font.unitsPerEm * size))
    let rowStart = (font.ascender/font.unitsPerEm * size) 
    let colStep = font.getAdvanceWidth("A",size); //mono sapce assumed
    const bitmap = document.createElement('canvas')
    bitmap.width = columns*colStep;
    bitmap.height = Math.ceil(font.numGlyphs/columns)*rowStep+rowStart
    const ctx = bitmap.getContext('2d')
    if (!ctx) {
        throw new Error()
    }
    for (let i = 0; i< font.numGlyphs; i++ ){
        if (i!=0 && i % columns == 0){
           row++ 
        }
        let y = rowStart+(row)*rowStep
        let x = (i%columns)*colStep
        let g = font.glyphs.get(i)
        g.draw(ctx,x,y)
        if (g.unicode) {
            /*
                you have to record them from the top,
                note the middle point in which they started from
                i.e. first one is 
                0,1,
                x+colStep/h , 1
                x

            */
            let left = x/bitmap.width;
            let right = (x+colStep)/bitmap.width;
            let top = 1-(y-rowStart)/bitmap.height;
            let bottom = 1-(y+rowStep-rowStart)/bitmap.height;
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
    return {img:ctx.getImageData(0,0,bitmap.width,bitmap.height),atlas:aMap}
}

