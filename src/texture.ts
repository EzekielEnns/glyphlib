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
