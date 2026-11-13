import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-achievement-header',emptyOutDir:true,sourcemap:false,minify:'esbuild',lib:{entry:'src/product-achievement-header-entry.ts',formats:['es'],fileName:()=> 'product-achievement-header.mjs'},rollupOptions:{output:{inlineDynamicImports:true}}}});
