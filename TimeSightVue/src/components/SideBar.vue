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
	/*border-bottom: 3px white solid;*/
	width: 200px;
}

img.icons {
	height: 9%;
	/*width: 70%;*/
	margin: auto 25px;
	padding: 0 20px;
}

#sidebar-container > img {

}

hr {
	width: 100%;
}

#sidebar-container {
	margin: 0;
}
</style>
