<script setup>
import axios from 'axios';
const API = "http://localhost:3000";

import { ref, onMounted, toRaw } from "vue";
import { fetchData, formatDate, getTermineByDate } from "./DataAccess.js";

const toDoTermine = ref([]);
const overTermine = ref([]);
const doneTermine = ref([]);
const dates = ref([]);
const datesIn = ref(new Set())

onMounted(async () => {
    const data = await fetchData();
    toDoTermine.value = data.toDoTermine;
    overTermine.value = data.overTermine;
    doneTermine.value = data.doneTermine;
    datesIn.value = data.datesIn
    dates.value = data.dates;
});
</script>

<template>
    <dl>
        <template v-for="(dateObj, index) in dates" :key="index">
            <dt>
                <h2>{{ formatDate(dateObj) }}</h2>
            </dt>

            <template v-for="termin in getTermineByDate(overTermine, datesIn[index])" :key="termin.pk_termin_id">
                <dd>
                    <h3>{{ termin.bezeichnung }}</h3>

                </dd>
            </template>
        </template>
    </dl>
</template>

<style scoped>
* {
    font-family: JockeyOne;
    src: url('@/assets/fonts/JockeyOne-Regular.ttf');
}

h3 {
    margin: 0%;
    padding: 1rem;
}

dt {
    margin-left: 1%;
}

dd {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1% 20% 1% 3%;
    border-radius: 1em;
    background-color: var(--field-dark);
}
</style>
