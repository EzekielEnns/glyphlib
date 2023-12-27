![demo](https://github.com/EzekielEnns/glyphlib/assets/54285948/c3b86ba4-dafd-460e-a2be-c5fa767664c7)

## insperation
this lib is desgined to help with creating tui based games in the browser,
things a kin to nethack or dwarf fortress

most webgl libs dont offer a flexable way to render text, they just convert a string into a image,
this lib dose the following
- generates a texture atlas for a given open font file
- uses js classes to wrap around 3 webgl attribs: texture, color and postion
- offers low level control of how these attribs are set
- offers low level control of how render loop is done

the api for this lib is still WIP
right now the api works based on layers, each layer is a set of verties/quads that have a texture mapped to them
indexing can happen in a cell/grid based way or just via 0 index'd 
the process for using is:
add a layer
set textures in that layer.... do all you need
add another layer
repeat

sequential layers are drawn ontop of other layers,
each "cell"/text character can be directly addressed and modfied
via a quad class that enables getting the difference between two points.

## TODO
- [ ] might implement a beziar curve if its needed
- [ ] add better api for unquie layers i.e a layer with uniforms or more attribs
- [ ] fix atlasing, draws a weird line occasionally
