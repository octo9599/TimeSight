<script setup>
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'

const calendarOptions = {
  plugins: [dayGridPlugin],
  initialView: 'dayGridMonth',
  events: 'http://localhost:3000/termine'
}
</script>

<template>
  <FullCalendar :options="calendarOptions" />
</template>
