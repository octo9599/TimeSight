<script setup>
	import FullCalendar from '@fullcalendar/vue3'
	import dayGridPlugin from '@fullcalendar/daygrid'
	import { fetchData, formatDate } from '@/components/DataAccess.mjs'
	import { ref, onMounted, nextTick } from 'vue';

	import TaskView from './components/TaskView.vue';

	const calendarRef = ref(null);
	let data;
	let termine;
	const events = [];

	const isTerminSelected = ref(false);
	const terminViewRef = ref(null);

	onMounted(async () => {
		const calendarApi = calendarRef.value.getApi();

		data = await fetchData();
		termine = [...data.toDoTermine, ...data.overTermine, ...data.doneTermine];
		termine.forEach(termin => {
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
				end: termin.datum
			});
		});
	});

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
	<TaskView ref="terminViewRef" v-if="isTerminSelected"/>
</template>

<style>

	#calendar-wrapper {
		padding: 24px;
		height: 100%;
		font-family: JockeyOne;
		font-size: large;
	}


	/* general calendar styling */

	.fc-header-toolbar .fc-toolbar-chunk {
		display: flex;
		align-items: center;
	}

	.fc-header-toolbar .fc-toolbar-title {
		margin-left: 10px; /* spacing between buttons and title */
	}


	.fc .fc-daygrid-day-top {
		display: flex !important;
		justify-content: flex-start !important;
		align-items: flex-start;
		padding-left: 4px;
	}

	.fc .fc-daygrid-day-number {
		float: none !important;
		margin-right: 4px; /* optional spacing */
	}

	.fc-toolbar-title {
		font-size: 1.6rem;
		font-weight: 600;
		color: #DBF1FF;
	}

	.fc-button {
		background: transparent !important;
		border: none !important;
		color: #DBF1FF !important;
	}

	.fc-button:hover {
		color: #ffffff !important;
	}

	.fc-theme-standard td,
	.fc-theme-standard th {
		border: 1px solid #14364E;
		border-width: 3px;
	}

	.fc-daygrid-day {
		background: transparent;
	}

	.fc-daygrid-day-number {
		color: #DBF1FF;
		font-weight: 500;
	}

	.fc-day-today {
		background: transparent !important;
	}

	.fc-day-today .fc-daygrid-day-number {
		background: #3256A8;
		color: #DBF1FF;
		border-radius: 100%;
		padding: 1px 7px;
	}

	.fc-day-other {
		opacity: 0.35;
	}

	.fc-col-header-cell {
		background: transparent;
		color: #DBF1FF;
		font-weight: 500;
	}


	/* --remove outlines-- */

	.fc-scrollgrid {
		border: none !important;
	}

	.fc-scrollgrid-section > * {
		border: none !important;
	}

	.fc-daygrid-day,
	.fc-col-header-cell {
		border-right: 1px solid #1e3a5f;
		border-bottom: 1px solid #1e3a5f;
	}

	.fc-daygrid-day:last-child,
	.fc-col-header-cell:last-child {
		border-right: none !important;
	}

	.fc-daygrid tr:last-child .fc-daygrid-day {
		border-bottom: none !important;
	}


	/* view switch buttons */

	.fc-dayGridMonth-button,
	.fc-dayGridWeek-button {
		background: #0b2a3f !important;
		color: #cbd5e1 !important;
		border: 3px solid #14364E !important;
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
		background: #14364E !important;
		color: #ffffff !important;
	}

	.fc-dayGridMonth-button:hover,
	.fc-dayGridWeek-button:hover {
		background: #163a55 !important;
	}

	.fc-dayGridMonth-button:focus,
	.fc-dayGridWeek-button:focus {
		box-shadow: none !important;
	}

	.fc-today-button {
		border: 1px solid #14364E !important;
	}

</style>