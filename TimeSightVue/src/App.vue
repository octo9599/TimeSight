<script setup>
import SideBar from "@/components/SideBar.vue";
import TopBar from "@/components/TopBar.vue";
import AddTask from "./components/AddTask.vue";
import AccPopup from "./components/AccPopup.vue";

import { useLoadTaskStore } from '@/stores/loadTask.ts';
import { useRouter } from "vue-router";
import { ref, watch, onMounted, computed } from "vue";

const router = useRouter();
const loadTaskStore = useLoadTaskStore();

const isAddVisible = ref(false);
const isPopupVisible = ref(false);

const darkMode = ref(true);

function applyTheme() {
	document.documentElement.classList.toggle("dark", darkMode.value);
	localStorage.setItem("darkMode", darkMode.value);
}

watch(darkMode, applyTheme);

onMounted(() => {
	const saved = localStorage.getItem("darkMode");
	darkMode.value = saved !== null ? saved === "true" : true; // Default to true if not set
	applyTheme();
});


function addChangeVisibility() {
	isAddVisible.value = !isAddVisible.value;
	if (!isAddVisible.value) {
		loadTaskStore.shouldLoad = true;
	}
}

function popupChangeVisibility() {
	isPopupVisible.value = !isPopupVisible.value;
}

const routeCheck = computed(() => router.currentRoute.value.path != '/auth');
</script>

<template>
	<TopBar :showAcc="routeCheck" :showLogo="routeCheck" :darkMode="darkMode" @showPopup="popupChangeVisibility" />
	<div id="horizontal-container">
		<div id="sidebar">
			<SideBar v-if="routeCheck" :darkMode="darkMode" @addTask="addChangeVisibility" />
		</div>
		<div id="test">
			<div v-if="isPopupVisible" class="popup-overlay" @click.self="popupChangeVisibility">
				<AccPopup :darkMode="darkMode" @toggle-theme="darkMode = !darkMode" @close="popupChangeVisibility" class="popup-window" />
			</div>
			<RouterView />
			<div v-if="isAddVisible" class="modal-overlay" @click.self="addChangeVisibility">
				<AddTask @close="addChangeVisibility" class="modal-window" />
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
	background-color: var(--main);
}

#test {
	grid-column: 2;
	background-color: var(--main);
	color: var(--text);
	margin: 0;
	overflow: scroll;
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
	background: var(--main);
	border-radius: 12px;
	width: min(600px, 90vw);
	max-height: 85vh;
	overflow-y: auto;

	padding: 1.5rem;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);

	animation: modalIn 0.2s ease-out;
}

.popup-overlay {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: start;
	justify-content: end;
	background: rgba(0, 0, 0, 0.35);

	z-index: 1000;
}

.popup-window {
	position: fixed;
	gap: 0.3rem;
}

</style>