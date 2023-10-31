import { Router } from '@stricjs/router';
import { group } from '@stricjs/utils';
import { watch } from 'fs';

Bun.build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
})
const watcher = watch(import.meta.dir+"/src",()=>{
    Bun.build({
        entrypoints: ['./src/index.ts'],
        outdir: './dist'
    })
})


const plugin = group('dist');
export default new Router().plug(plugin);
