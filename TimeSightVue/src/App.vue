<script setup>
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
//import apiTest from "@/apiTests/apiTest.vue";
import ListView from "@/components/ListView.vue";
</script>

<template>
	<TopBar/>
	<div id="horizontal-container">
		<SideBar/>
		<!-- #test is just for showing the correct bg-color currently, should be removed when work on calendar view begins   -->
		<p id="test">Hello World this is a paragraph</p>
	</div>
	<!-- <ListView/> -->
	<ListView/>
	<!-- <apiTest/> -->
</template>

<style scoped>
/* make font available globally */
@font-face {
	font-family: JockeyOne;
	src: url('@/assets/fonts/JockeyOne-Regular.ttf');
}

#horizontal-container {
	display: flex;
	flex-direction: row;
	height: 88vh;
}

#test {
	width: 100%;
	background-color: var(--main-dark);
	margin: 0;
	color: var(--text-dark);
}
</style>
