## process for making this lib

started with inital idea/experimentation with webgl

once the expermentation showed enough results 
where the code for a lib made sense

the desing of a library was done,
I chose using raw js to make the library more veristile



[best font](https://jadedtwin.itch.io/pixel-bold-font?download)
## notes on texture atlases
webgl dose not care about power of 2 
but texture atlas's do care

keep mipmaps in mind


so atlasts are a tequine 
- texture atlas
- sprite sheet
essentally it reduces the amount of textures you have to load

they are textues that contain other textues

so what is unqine is uv coor and generating atlas
gpu cant handle so to many textues


#### making a atlas
use a tool to build your atlas
- imagemagick is a good option it has a command just for this job
*automate* when you can

so after we make the atlas,
we need to determine uv coors

you can use a single uv coord for the top left of the tex
atlas dementiosn and other things to just make it more portable might be nice

##### power of 2
mipmaps need power of two or else yourll get bleed through
so its good to scale up when able to something that is a power of 2
so a area that is to a power of 2 like 64x64

you can set limits for your mipmap chain to prevent the 
gross look
texParamiteri(set the max level to 7) or min
this func ^^^ just sets params for your loaded tex

so look for polution and prevent it 

### other prob
so the seems between the tiles break evenly
so you need to be careful of your uv coor
move them inside the atlas you can oversample it 

getting uv is 

u+w and v+h
w and h 

you need it to be in the chartizian plane/units form so 

w = size of text/width of image
....

charmap-cellphone atlas would work like this:
    ascii code 32-126 dec they are 5x7 per char
    128 x 64 pixels
94 characaters

```js
for (const x of Array(94).keys()){
    x+32 == ascii code
    uv = 
}

```
