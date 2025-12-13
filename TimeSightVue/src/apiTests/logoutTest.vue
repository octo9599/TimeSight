<script setup>
import axios from 'axios'

const API = "http://localhost:3000";

    async function logout() {

        try {
            await axios.post(`${API}/logout`);
            window.location.reload();
        } catch(err) {
            console.log(err);
        }

    }
</script>

<template>
  <button @click="logout"> Logout </button>
</template>

<style scoped>

</style>
