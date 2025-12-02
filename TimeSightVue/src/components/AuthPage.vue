<script setup>

    import axios from 'axios';
    import { ref } from 'vue';
    const isLogin = ref(true);

</script>

<template>

    <button @click=" isLogin = !isLogin"> Toggle Login/Signup</button>
    <div>{{ isLogin }} </div>

</template>

<style scoped>

</style>
