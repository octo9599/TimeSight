<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin],

  initialView: 'dayGridMonth',
  events: 'http://localhost:3000/termine',
  firstDay: 1,
  height: '100%',
  headerToolbar: {
    left: 'title prev,next today',
    right: 'dayGridMonth,dayGridWeek'
  },
  buttonText: {
    dayGridMonth: 'M',
    dayGridWeek: 'W'
  },
}
</script>

<template>
    <FullCalendar :options="calendarOptions" />
</template>
