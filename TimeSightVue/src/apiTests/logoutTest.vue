<script setup>
import axios from 'axios'
import { onMounted } from 'vue';

const API = "http://localhost:3000";

    onMounted( async () => {
        try {
            await axios.post(`${API}/logout`);
            window.location.reload();
        } catch(err) {
            console.log(err);
        }
    });
</script>

<template>
</template>

<style scoped>

</style>
