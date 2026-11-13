import {mount} from 'svelte';
import LocalePreview from './LocalePreview.svelte';
const target=document.getElementById('locale-root');if(!target)throw Error('MISSING_LOCALE_ROOT');mount(LocalePreview,{target});
