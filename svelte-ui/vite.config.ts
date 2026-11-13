import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
export default defineConfig({base:'./',plugins:[svelte()],server:{host:'127.0.0.1',strictPort:true,fs:{strict:true}},build:{outDir:'dist',emptyOutDir:true}});
