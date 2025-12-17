<script setup>
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
import {useRouter} from "vue-router";

const router = useRouter();
</script>

<template>
	<TopBar/>
	<div id="horizontal-container">
		<div id="sidebar">
			<SideBar/>
		</div>
		<!-- #test exists just to show the correct bg-color currently, should be removed when work on the actual calendar UI begins -->
		<!--<p id="test">Hello World this is a paragraph</p>-->
		<div id="test">
			<RouterView/>
		</div>
	</div>
</template>

<style scoped>
/* make font available globally */
@font-face {
	font-family: JockeyOne;
	src: url('@/assets/fonts/JockeyOne-Regular.ttf');
}

#horizontal-container {
	display: grid;
	grid-template-columns: 0.9fr 9.1fr;
	height: 84vh;
}

#sidebar {
	grid-column: 1;
}

#test {
	grid-column: 2;
	background-color: var(--main-dark);
	color: var(--text-dark);
	margin: 0;
}
</style>