<script setup>
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
import AddTask from "./components/AddTask.vue";
import { useLoadTaskStore } from '@/stores/loadTask.ts';
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const loadTaskStore = useLoadTaskStore();
const isAddVisible = ref(false);

function changeVisibleAdd() {
	isAddVisible.value = !isAddVisible.value;
	if (!isAddVisible.value) {
		loadTaskStore.shouldLoad = true;
	}
}

</script>

<template>
	<TopBar />
	<div id="horizontal-container">
		<div id="sidebar">
			<SideBar @addTask="changeVisibleAdd" />
		</div>
		<!-- #test exists just to show the correct bg-color currently, should be removed when work on the actual calendar UI begins -->
		<!--<p id="test">Hello World this is a paragraph</p>-->
		<div id="test">
			<RouterView />
			<div v-if="isAddVisible" class="modal-overlay" @click.self="changeVisibleAdd">
				<AddTask @close="changeVisibleAdd" class="modal-window" />
			</div>
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

/* AddTask Window */
.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.35);

	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);

	display: flex;
	align-items: center;
	justify-content: center;

	z-index: 1000;
}

.modal-window {
	background: var(--main-dark);
	border-radius: 12px;
	width: min(600px, 90vw);
	max-height: 85vh;
	overflow-y: auto;

	padding: 1.5rem;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);

	animation: modalIn 0.2s ease-out;
}
</style>