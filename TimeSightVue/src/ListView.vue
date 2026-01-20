<script setup>
import { computed, onMounted, ref, nextTick, watch } from "vue";
import { fetchData, formatDate, getTermineByDate, API } from "./components/DataAccess.mjs";
import { useUserStore } from "@/stores/user";
import { useLoadTaskStore } from '@/stores/loadTask.ts';
import axios from 'axios';
import TaskView from "./components/TaskView.vue";

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
		await axios.patch(`${API}/termin_user/`, {ist_erledigt: event.target.checked}, 
			{params: {termin_id: id, user_id: userStore.user.pk_user_id}}
		);
	} catch (err) {
		console.log(err);
	}
	loadTermine();
}

function closeTermin(is_changed) {
	if (is_changed) {
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
			loadTaskStore.shouldLoad = false;
		}
	},
	{ immediate: true }
);

onMounted(() => {
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
					<a href="#" class="termin" @click.prevent="viewTermin(termin.pk_termin_id)">
						<h3>{{ termin.bezeichnung }}</h3>
					</a>
					<input
						type="checkbox"
						:checked="termin.ist_erledigt === 1"
						@change="change_erledigt($event, termin.pk_termin_id)"
					/>
				</dd>
			</template>
		</template>
	</dl>

	<div v-if="isTerminSelected" class="modal-overlay" @click.self="closeTermin(true)">
		<TaskView ref="terminViewRef" class="modal-window" @close="closeTermin" />
	</div>
</template>

<style scoped>
* {
	color: var(--text);
}

h2 {
	margin: 0;
	font-weight: 400;
}

h3 {
	margin: 0;
	padding: 1rem;
	font-weight: 400;
}

#navbar {
	display: flex;
	gap: 2.5rem;
	margin: 1.5rem 0 1rem 3%;
	width: auto;
}

#navbar button.astext {
	background: none;
	border: none;
	padding: 0;
	margin: 0;
	cursor: pointer;
}

#navbar h2 {
	font-size: 1.2rem;
	font-weight: 400;
	opacity: 0.7;
	transition: opacity 0.15s ease, color 0.15s ease;
}

#navbar button.astext:hover h2 {
	opacity: 1;
}

#navbar button.active h2 {
	opacity: 1;
	text-decoration: underline;
	text-decoration-color: var(--accent);
	text-decoration-thickness: 2px;
	text-underline-offset: 6px;
}

dt {
	margin-left: 1%;
}

dd {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 1% 20% 1% 3%;
	border-radius: 1rem;
	background-color: var(--field);
}

.termin {
	text-decoration: none;
}

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
}
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;

  width: 28px;
  height: 28px;

  border: 3px solid var(--text);
  border-radius: 6px;

  margin-right: 1rem;

  background: transparent;
  cursor: pointer;

  position: relative; /* wichtig */
}

/* inner green square */
input[type="checkbox"]::before {
  content: "";
  width: 16px;
  height: 16px;

  background-color: var(--done);
  border-radius: 3px;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);

  transition: transform 0.12s ease-in-out;
}

/* checked state */
input[type="checkbox"]:checked::before {
  transform: translate(-50%, -50%) scale(1);
}

</style>
