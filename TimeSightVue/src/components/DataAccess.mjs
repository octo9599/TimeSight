import axios from 'axios';
import {useUserStore} from '@/stores/user.ts';

export const API = "http://localhost:3000";

export async function fetchData() {
	try {
		const userStore = useUserStore();

		const groupsIn = await axios.get(`${API}/user/${userStore.user.pk_user_id}/gruppe`);
		const groups = groupsIn.data.map(group => group.pk_group_id);

		let toDoTermine = [];
		let overTermine = [];
		let doneTermine = [];
		let groupUsers = {};

		for (const group of groups) {
			const [toDoIn, overIn, doneIn, usersIn] = await Promise.all([
				axios.get(`${API}/gruppe/${group}/termin`),
				axios.get(`${API}/gruppe/${group}/termin`, {params: {is_past_due: 1}}),
				axios.get(`${API}/gruppe/${group}/termin`, {params: {ist_erledigt: 1}}),
				axios.get(`${API}/gruppe/${group}/user`)
			]);

			toDoTermine.push(...toDoIn.data);
			overTermine.push(...overIn.data);
			doneTermine.push(...doneIn.data);
			groupUsers[group] = (usersIn.data);
		}

		let datesIn = new Set();
		let dates = [];
		for (const termin of [...toDoTermine, ...overTermine, ...doneTermine]) {
			datesIn.add(termin.datum);
		}
		datesIn = Array.from(datesIn);
		datesIn.sort();
		for (const date of datesIn) {
			dates.push(new Date(date));
		}

		return {user: userStore.user, groupsIn, groups, groupUsers, toDoTermine, overTermine, doneTermine, datesIn, dates};
	} catch (err) {
		console.error(err);
		return {groupsIn: [], groups: [], groupUsers: {}, toDoTermine: [], overTermine: [], doneTermine: [], datesIn: [], dates: []};
	}
}

export function formatDate(date) {
	const weekday = date.toLocaleDateString('de-DE', {weekday: 'short'}).toUpperCase();
	const day = date.getDate();
	const month = date.toLocaleDateString('de-DE', {month: 'long'});
	const year = date.getFullYear();

	return `${weekday}, ${day}. ${month} ${year}`;
}

export function getTermineByDate(termine, date) {
	return termine.filter(t => t.datum.startsWith(date));
}