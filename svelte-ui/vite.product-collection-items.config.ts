import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-collection-items',emptyOutDir:true,sourcemap:false,minify:'esbuild',lib:{entry:'src/product-collection-items-entry.ts',formats:['es'],fileName:()=> 'product-collection-items.mjs'},rollupOptions:{output:{inlineDynamicImports:true}}}});
