<script setup>

import {ref} from 'vue';
import Login from './components/Login.vue';
import Signup from './components/Signup.vue';

const isLogin = ref(true);

function switchAuth() {
  isLogin.value = !isLogin.value;
}

</script>

<template>

	<div>
		<button @click=" isLogin = !isLogin"> Toggle Login/Signup</button>
		<Login v-if="isLogin"/>
		<Signup v-else/>

		<Login v-if="isLogin" @switch="switchAuth" />
    	<Signup v-else @switch="switchAuth" />
		
	</div>
</template>

<style scoped>

</style>