<script setup></script>

<template>
	<div id="sidebar-container">
		<img id="calendar-icon" alt="Group Icon Dark" class="icons" src="@/assets/images/Kalender-Dark.png">
		<hr>
		<img id="list-icon" alt="Group Icon Dark" class="icons" src="@/assets/images/List-Dark.png">
		<hr>
		<img id="group-icon" alt="Group Icon Dark" class="icons" src="@/assets/images/Group-Dark.png">
		<hr>
		<img id="add-icon" alt="Group Icon Dark" class="icons" src="@/assets/images/+-Dark.png">
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