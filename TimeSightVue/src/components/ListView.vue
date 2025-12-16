<script setup>
import { ref, onMounted} from "vue";
import { fetchData, formatDate, getTermineByDate } from "./DataAccess.mjs";

const toDoTermine = ref([]);
const overTermine = ref([]);
const doneTermine = ref([]);
const user = ref({})
const dates = ref([]);
const datesIn = ref(new Set())

const view = ref("todo");

const setView = (v) => {
  view.value = v
}

onMounted(async () => {
    const data = await fetchData();
    toDoTermine.value = data.toDoTermine;
    overTermine.value = data.overTermine;
    doneTermine.value = data.doneTermine;
    user.value = data.user;
    datesIn.value = data.datesIn
    dates.value = data.dates;
});

console.log(user.value);
</script>

<template>
    <div id="navbar">
    <button @click="setView('todo')" 
        :class="{ active: view === 'todo' }"
        class="astext"><h2>Ausstehend</h2></button>
        
    <button @click="setView('over')" 
        :class="{ active: view === 'over' }"
        class="astext"><h2>Zurückliegend</h2></button>
        
    <button @click="setView('done')" 
        :class="{ active: view === 'done' }"
        class="astext"><h2>Abgeschlossen</h2></button>
    </div>

    <dl>
        <template v-for="(date, index) in dates" :key="index">
            <dt>
                <h2>{{ formatDate(date) }}</h2>
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

dd {
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
    background:none;
    border:none;
    margin:1rem 1.5rem 1rem 1.5rem;
    padding:0;
    cursor: pointer;
}

.active {
    text-decoration: underline;
    text-decoration-color: var(--accent-dark);
    text-decoration-thickness: 2px;
}

#navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 35%;
}
</style>
