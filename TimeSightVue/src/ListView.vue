<script setup>
	import {computed, onMounted, ref, nextTick, watch } from "vue";
	import {fetchData, formatDate, getTermineByDate} from "./components/DataAccess.mjs";
	import {useUserStore} from "@/stores/user";
	import {useLoadTaskStore} from '@/stores/loadTask.ts';
	import axios from 'axios';
	import TaskView from "./components/TaskView.vue";

	const API = "http://localhost:3000";

	const toDoTermine = ref([]);
	const overTermine = ref([]);
	const doneTermine = ref([]);
	const dates = ref([]);
	const datesIn = ref([]);

	const userStore = useUserStore();
	const loadTaskStore = useLoadTaskStore();

	const isTerminSelected = ref(false);
	const terminViewRef = ref(null);

	const view = ref("todo");
	const list = computed(() => {
		if (view.value === "todo") return toDoTermine.value;
		if (view.value === "over") return overTermine.value;
		if (view.value === "done") return doneTermine.value;
		return [];
	});

	const sortedDatesIn = computed(() => {
		const arr = [...datesIn.value];
		return view.value === 'todo' ? arr.sort() : arr.sort().reverse();
	});

	const sortedDates = computed(() => {
		const arr = [...dates.value];
		if (view.value === "todo") {
			return arr.sort((a, b) => a.getTime() - b.getTime());
		} else {
			return arr.sort((a, b) => b.getTime() - a.getTime());
		}
	});

	async function viewTermin(id) {
		isTerminSelected.value = true;
		await nextTick();
		terminViewRef.value.init_termin(id);
	}

	async function change_erledigt(event, id) {

		try {
			console.log((await axios.patch(`${API}/termin/${id}`, {
				ist_erledigt: event.target.checked
			})).data);

		} catch (err) {
			console.log(err);
		}

		loadTermine();

	}

	function closeTermin(is_changed) {
		if(is_changed) {
			loadTermine();
		}
		isTerminSelected.value = false;
	}

	async function loadTermine() {
		const data = await fetchData();
		toDoTermine.value = data.toDoTermine;
		overTermine.value = data.overTermine;
		doneTermine.value = data.doneTermine;
		datesIn.value = data.datesIn;
		dates.value = data.dates;
	}


	watch(
		() => loadTaskStore.shouldLoad,
		(newVal) => {
			if (newVal === true) {
				loadTermine();
				loadTaskStore.shouldLoad = false
			}
		},
		{ immediate: true }
	);

	onMounted(async () => {
		loadTermine();
	});
</script>

<template>
	<div id="navbar">
		<button :class="{ active: view === 'todo' }" class="astext" @click="view = 'todo'">
			<h2>Ausstehend</h2>
		</button>

		<button :class="{ active: view === 'over' }" class="astext" @click="view = 'over'">
			<h2>Zurückliegend</h2>
		</button>

		<button :class="{ active: view === 'done' }" class="astext" @click="view = 'done'">
			<h2>Abgeschlossen</h2>
		</button>
	</div>

	<dl>
		<template v-for="(date, index) in sortedDates" :key="index">
			<template v-for="(termin, i) in getTermineByDate(list, sortedDatesIn[index])" :key="termin.pk_termin_id">
				<template v-if="termin && i === 0">
					<dt>
						<h2>{{ formatDate(date) }}</h2>
					</dt>
				</template>
				<dd>
					<a href="#" class="termin" @click.prevent="viewTermin(termin.pk_termin_id)"><h3>{{ termin.bezeichnung }}</h3></a>
					<input type="checkbox" :checked="termin.ist_erledigt === 1" @change="change_erledigt($event, termin.pk_termin_id)"/>
				</dd>
			</template>
		</template>
	</dl>

	<div v-if="isTerminSelected" class="modal-overlay" @click.self="closeTermin(true)">
		<TaskView
			ref="terminViewRef"
			class="modal-window"
			@close="closeTermin"
		/>
	</div>
</template>

<style scoped>
* {
	font-family: JockeyOne;
	src: url('@/assets/fonts/JockeyOne-Regular.ttf');
	color: var(--text-dark);
}

h2 {
	margin: 0px;
}

h3 {
	margin: 0%;
	padding: 1rem;
}

dt {
	margin-left: 1%;
}

dd, button {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 1% 20% 1% 3%;
	border-radius: 1rem;
	background-color: var(--field-dark);
}

ul {
	list-style-type: none;
	margin: 0;
	padding: 0;
	overflow: hidden;
}

li {
	float: left;

}

.astext {
	background: none;
	border: none;
	margin: 1rem 1.5rem 1rem 1.5rem;
	padding: 0;
	cursor: pointer;
}

.active {
	text-decoration: underline;
	text-decoration-color: var(--accent-dark);
	text-decoration-thickness: 2px;
}

.termin {
	text-decoration: none;
}

#navbar {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 35%;
}


/* TaskView Window */
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