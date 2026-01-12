<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const emits = defineEmits(['addTask']);

const props = defineProps({
	darkMode: {
		type: Boolean,
		required: true
	}
});

function notifyParent() {
	emits('addTask');
}

import KalenderDark from '@/assets/images/Kalender-Dark.png';
import KalenderLight from '@/assets/images/Kalender-Light.png';
import KalenderDarkHover from '@/assets/images/Kalender-Dark-Hover.png';
import KalenderLightHover from '@/assets/images/Kalender-Light-Hover.png';

import ListDark from '@/assets/images/List-Dark.png';
import ListLight from '@/assets/images/List-Light.png';
import ListHover from '@/assets/images/List-Hover.png';

import GroupDark from '@/assets/images/Group-Dark.png';
import GroupLight from '@/assets/images/Group-Light.png';
import GroupDarkHover from '@/assets/images/Group-Dark-Hover.png';
import GroupLightHover from '@/assets/images/Group-Light-Hover.png';

import AddDark from '@/assets/images/+-Dark.png';
import AddLight from '@/assets/images/+-Light.png';


const calendarIcon = computed(() => {
	if (route.path === '/calendar') {
		return props.darkMode ? KalenderDarkHover : KalenderLightHover;
	}
	return props.darkMode ? KalenderDark : KalenderLight;
});

const listIcon = computed(() => {
	if (route.path === '/list') {
		return ListHover;
	}
	return props.darkMode ? ListDark : ListLight;
});

const groupIcon = computed(() => {
	if (route.path === '/groups') {
		return props.darkMode ? GroupDarkHover : GroupLightHover;
	}
	return props.darkMode ? GroupDark : GroupLight;
});

const addIcon = computed(() =>
	props.darkMode ? AddDark : AddLight
);
</script>

<template>
	<div id="sidebar-container">
		<router-link to="/calendar" class="router-links">
			<img id="calendar-icon" class="icons" :src="calendarIcon" alt="Calendar Icon" />
		</router-link>

		<hr>

		<router-link to="/list" class="router-links">
			<img id="list-icon" class="icons" :src="listIcon" alt="List Icon" />
		</router-link>

		<hr>

		<router-link to="/groups" class="router-links">
			<img id="group-icon" class="icons" :src="groupIcon" alt="Group Icon" />
		</router-link>

		<hr>

		<button @click="notifyParent" id="addBtn" class="router-links">
			<img id="add-icon" class="icons" :src="addIcon" alt="Add Icon" />
		</button>
	</div>
</template>

<style scoped>
#sidebar-container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	background-color: var(--main);
	border-right: 3px var(--text) solid;
	width: 100%;
	height: 100%;
	margin: 0;
}

.router-links {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 100%;
	cursor: pointer;
}

.icons {
	max-width: 50%;
	height: auto;
	margin: auto 2%;
	cursor: pointer;
}

hr {
	width: 85%;
}

#addBtn {
	background-color: var(--main);
	border: none;
}
</style>
