import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-categories',emptyOutDir:true,sourcemap:false,minify:'esbuild',lib:{entry:'src/product-categories-entry.ts',formats:['es'],fileName:()=> 'product-categories.mjs'},rollupOptions:{output:{inlineDynamicImports:true}}}});
