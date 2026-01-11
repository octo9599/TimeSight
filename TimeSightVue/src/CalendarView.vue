<script setup>
	import FullCalendar from '@fullcalendar/vue3'
	import dayGridPlugin from '@fullcalendar/daygrid'
	import { fetchData, formatDate } from '@/components/DataAccess.mjs'
	import {useLoadTaskStore} from '@/stores/loadTask.ts';
	import { ref, onMounted, nextTick, watch } from 'vue';

	import TaskView from './components/TaskView.vue';

	const loadTaskStore = useLoadTaskStore();

	const calendarRef = ref(null);
	let data;
	let termine;
	const events = [];

	const isTerminSelected = ref(false);
	const terminViewRef = ref(null);

	onMounted(async () => {
		loadTermine();
	});

	async function loadTermine() {
		const calendarApi = calendarRef.value.getApi();

		calendarApi.removeAllEvents();
		data = await fetchData();
		termine = [...data.toDoTermine, ...data.overTermine, ...data.doneTermine];
		termine.forEach(termin => {
			let endtime = termin.datum;
			if(endtime.substring(endtime.indexOf(' ')+1, endtime.length-3) == '23:59') {
				endtime = termin.datum.substring(0, termin.datum.indexOf(' ')) + " 24:00:00";
			}
			let bezeichnung = "";
			if(termin.ist_erledigt === 1) {
				bezeichnung = termin.bezeichnung + " ✓";
			} else {
				bezeichnung = termin.bezeichnung;
			}
			calendarApi.addEvent({
				id: termin.pk_termin_id,
				title: bezeichnung,
				start: termin.datum,
				end: endtime
			});
		});
	}

	function closeTermin(is_changed) {
		isTerminSelected.value = false;
		if(is_changed) {
			loadTermine();
		}
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

	const calendarOptions = {
		plugins: [dayGridPlugin],
		initialView: 'dayGridMonth',
		firstDay: 1,
		dayHeaderFormat: { weekday: 'short'},
		height: '100%',
		locale: 'de',
		fixedWeekCount: false,
		showNonCurrentDates: true,
		nowIndicator: true,
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: 'dayGridMonth,dayGridWeek'
		},
		buttonText: {
			dayGridMonth: 'M',
			dayGridWeek: 'W'
		},

		async eventClick(info) {
			isTerminSelected.value = true;
			await nextTick();
			terminViewRef.value.init_termin(info.event.id);
		}
	};

</script>

<template>
	<div id="calendar-wrapper">
		<FullCalendar ref="calendarRef" :options="calendarOptions"/>
	</div>
		<div v-if="isTerminSelected" class="modal-overlay" @click.self="closeTermin(true)">
		<TaskView
			ref="terminViewRef"
			class="modal-window"
			@close="closeTermin"
		/>
	</div>
</template>

<style>
#calendar-wrapper {
  padding: 24px;
  height: 100%;
  font-family: JockeyOne;
  font-size: large;
}

/* =========================
   GENERAL CALENDAR STYLING
========================= */

.fc-header-toolbar .fc-toolbar-chunk {
  display: flex;
  align-items: center;
}

.fc-header-toolbar .fc-toolbar-title {
  margin-left: 10px;
}

.fc-toolbar-title {
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--text);
}

.fc-button {
  background: transparent !important;
  border: none !important;
  color: var(--text) !important;
}

.fc-button:hover {
  color: var(--text) !important;
  opacity: 0.9;
}

/* =========================
   GRID / BORDERS
========================= */

.fc-theme-standard td,
.fc-theme-standard th {
  border: 3px solid var(--field);
}

.fc-daygrid-day {
  background: transparent;
}

.fc-daygrid-day-number {
  color: var(--text);
  font-weight: 500;
}

.fc-day-today {
  background: transparent !important;
}

.fc-day-today .fc-daygrid-day-number {
  background: var(--today);
  color: var(--text);
  border-radius: 100%;
  padding: 1px 7px;
}

.fc-day-other {
  opacity: 0.35;
}

.fc-col-header-cell {
  background: transparent;
  color: var(--text);
  font-weight: 500;
}

/* =========================
   REMOVE OUTLINES
========================= */

.fc-scrollgrid {
  border: none !important;
}

.fc-scrollgrid-section > * {
  border: none !important;
}

.fc-daygrid-day,
.fc-col-header-cell {
  border-right: 1px solid var(--field);
  border-bottom: 1px solid var(--field);
}

.fc-daygrid-day:last-child,
.fc-col-header-cell:last-child {
  border-right: none !important;
}

.fc-daygrid tr:last-child .fc-daygrid-day {
  border-bottom: none !important;
}

/* =========================
   VIEW SWITCH BUTTONS
========================= */

.fc-dayGridMonth-button,
.fc-dayGridWeek-button {
  background: var(--main) !important;
  color: var(--text) !important;
  border: 3px solid var(--field) !important;
  height: 60px;
  width: 70px;
  padding: 6px 14px;
  font-size: x-large !important;
  box-shadow: none !important;
}

.fc-dayGridWeek-button {
  border-left: none !important;
}

.fc-dayGridMonth-button {
  border-radius: 6px 0 0 6px !important;
}

.fc-dayGridWeek-button {
  border-radius: 0 6px 6px 0 !important;
}

.fc-button-active {
  background: var(--field) !important;
  color: var(--text) !important;
}

.fc-dayGridMonth-button:hover,
.fc-dayGridWeek-button:hover {
  background: var(--field) !important;
}

.fc-dayGridMonth-button:focus,
.fc-dayGridWeek-button:focus {
  box-shadow: none !important;
}

.fc-today-button {
  border: 1px solid var(--field) !important;
}

/* =========================
   TASK VIEW MODAL
========================= */

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


</style>