<script setup>
    const emit = defineEmits(['close', 'toggle-theme']);

defineProps({
  darkMode: Boolean
});


</script>

<template>
    <div id="content">
        <router-link class="links" to="/account" @click="emit('close')">Account</router-link>
        <button id="mode-btn" @click="$emit('toggle-theme')">{{ darkMode ? 'Light Mode' : 'Dark Mode' }}</button>
        <router-link class="links" id="logout" to="/logout">Log out</router-link>
    </div>
</template>

<style scoped>
    #content {
        background-color: var(--main);
        display: flex;
        flex-direction: column;
        align-items: end;
        font-size: large;
        border-style: solid;
        border-radius: 5px;
        border-color: var(--field); 
        padding-right: 10px;
        padding-left: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
        margin-top: 7%;
        margin-right:3%;
        gap: 1rem;
    }
    
    .links {
        text-decoration: none;
        color: var(--text);
    }

    #mode-btn {
        border: none;
        background-color: var(--main);
        color: var(--text);
        padding:0;
        font-size: large;
    }

    #logout {
        color: red;
    }
</style>