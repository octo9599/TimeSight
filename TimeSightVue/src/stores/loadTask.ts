import {defineStore} from "pinia";
import {ref} from 'vue';

export const useLoadTaskStore = defineStore("loadTask", () => {
    const shouldLoad = ref(false);
    return shouldLoad;
});