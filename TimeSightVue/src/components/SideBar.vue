<script setup>

	const emits = defineEmits(['addTask']);

	function notifyParent() {
		emits('addTask');
	}

</script>

<template>
	<div id="sidebar-container">
		<router-link to="/calendar" class="router-links">
			<img id="calendar-icon" alt="Calendar Icon" class="icons" src="@/assets/images/Kalender-Dark.png">
		</router-link>
		<hr>
		<router-link to="/list" class="router-links">
			<img id="list-icon" alt="List Icon" class="icons" src="@/assets/images/List-Dark.png">
		</router-link>
		<hr>
		<router-link to="/groups" class="router-links">
			<img id="group-icon" alt="Group Icon" class="icons" src="@/assets/images/Group-Dark.png">
		</router-link>
		<hr>
		<button @click="notifyParent" id="addBtn" class="router-links"> <!-- add + page -->
			<img id="add-icon" alt="Add Icon" class="icons" src="@/assets/images/+-Dark.png">
		</button>
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

.router-links {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 100%;
	cursor: pointer;
}

.icons {
	max-width: 50%;
	height: auto;
	margin: auto 2%;
}

hr {
	width: 85%;
}

#sidebar-container {
	margin: 0;
}

#addBtn {
	background-color: var(--main-dark);
	border: none;
}
</style>