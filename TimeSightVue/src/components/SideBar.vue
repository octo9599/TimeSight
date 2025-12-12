<script setup></script>

<template>
	<div id="sidebar-container">
		<img src="@/assets/images/Kalender-Dark.png" alt="Group Icon Dark" class="icons" id="calendar-icon">
		<hr>
		<img src="@/assets/images/List-Dark.png" alt="Group Icon Dark" class="icons" id="list-icon">
		<hr>
		<img src="@/assets/images/Group-Dark.png" alt="Group Icon Dark" class="icons" id="group-icon">
		<hr>
		<img src="@/assets/images/+-Dark.png" alt="Group Icon Dark" class="icons" id="add-icon">
	</div>
</template>

<style scoped>
#sidebar-container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	background-color: var(--main-dark);
	border-right: 3px var(--text-dark) solid;
	width: 100%;
	height: 100%;
}

img.icons {
	max-width: 55%;
	height: auto;
	margin: auto 2%;
}

hr {
	width: 85%;
}

#sidebar-container {
	margin: 0;
}
</style>
