import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-tabs',emptyOutDir:true,sourcemap:false,minify:'esbuild',lib:{entry:'src/product-tabs-entry.ts',formats:['es'],fileName:()=> 'product-tabs.mjs'},rollupOptions:{output:{inlineDynamicImports:true}}}});
