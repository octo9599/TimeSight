<script setup>
    import ListView from './components/ListView.vue';

</script>

<template>
		<div>
			<ListView id="test"/>
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
	grid-template-columns: 1.1fr 8.9fr;
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
