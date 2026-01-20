<script setup>
import axios from 'axios'
import {onMounted} from 'vue';
import { API } from '@/components/DataAccess.mjs';

onMounted(async () => {
	try {
		await axios.post(`${API}/logout`);
		window.location.reload();
	} catch (err) {
		console.log(err);
	}
});
</script>

<template>
</template>

<style scoped>

</style>
