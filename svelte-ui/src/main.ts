import { mount } from 'svelte';
import App from './App.svelte';
import './reference-navigation.css';
const target=document.getElementById('app');
if(!target) throw new Error('Missing isolated mount target');
mount(App,{target});
