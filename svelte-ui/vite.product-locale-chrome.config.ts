import {defineConfig} from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],esbuild:{legalComments:'none'},build:{outDir:'dist-product-locale-chrome',emptyOutDir:true,sourcemap:false,lib:{entry:'src/product-locale-chrome-entry.ts',formats:['es'],fileName:()=> 'product-locale-chrome.mjs',cssFileName:'product-locale-chrome'},rollupOptions:{output:{inlineDynamicImports:true}}}});
