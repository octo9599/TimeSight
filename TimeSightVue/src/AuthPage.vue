<script setup>

    import axios from 'axios';
    import { ref, onMounted } from 'vue';
    import Login from './components/Login.vue';
    import Signup from './components/Signup.vue';

    const isLogin = ref(true);


</script>

<template>

    <div>
        <button @click=" isLogin = !isLogin"> Toggle Login/Signup</button>
        <Login v-if="isLogin" />
        <Signup v-else="!isLogin" />
    </div>
</template>

<style scoped>

</style>
