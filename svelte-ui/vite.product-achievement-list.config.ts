import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-achievement-list',emptyOutDir:true,sourcemap:false,minify:'esbuild',lib:{entry:'src/product-achievement-list-entry.ts',formats:['es'],fileName:()=> 'product-achievement-list.mjs'},rollupOptions:{output:{inlineDynamicImports:true}}}});
