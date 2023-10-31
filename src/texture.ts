/*

two things this part can do 
1) generate a bitmap image
2) generate a map of the image

Texture coord system
0,1         1,1


0,0         1,0 
*/
interface AtlasMap {
    [glpyh:string]: Array<number>
}

function genMap(iW:number,iH:number,gW:number,gH:number):AtlasMap{
    let aMap:AtlasMap = {}
    for (let i=0; i<96; i++){
        
    }
    return {}
}
