<script setup></script>

<template>
	<div id="topbar-container">
		<section class="topbar-icon-containers">
			<a href="/">
				<img id="eye-icon" alt="TimeSight Logo" class="icons" src="@/assets/images/Logo.png">
			</a>
		</section>
		<!-- janky but working way to make T and S colored differently
		(and if it's not all on one line it doesn't even look that ugly (in the code, not on the site lol) anymore...) -->
		<h1>
			<!-- These two spans do have to be on the same line though because if
			they weren't, the heading would read "Time Sight" rather than "TimeSight" -->
			<span class="highlighted">T</span>ime<span class="highlighted">S</span>ight
		</h1>
		<!-- actual account icon will go here once available -->
		<section id="account-icon-container" class="topbar-icon-containers">
			<img id="acc-icon" alt="Account Menu" class="icons" src="@/assets/images/TEMPORARY-Account-Icon.png">
		</section>
	</div>
</template>

<style scoped>
h1 {
	font-family: JockeyOne, serif;
	color: var(--text-dark);
	font-size: 94px;
	letter-spacing: 3px;
	margin: 0 auto;
}

span.highlighted {
	color: var(--accent-dark);
}

#topbar-container {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: var(--main-dark);
	border-bottom: 3px var(--text-dark) solid;
	height: 16vh;
}

img.icons {
	max-width: 80%;
	height: auto;
}

/*
	CSS needs to be this way (separated into section.topbar-icons and a selectors)
   	because we have one icon nested into section>a and one into section (because one needs to be a link, duh.)
*/
section.topbar-icon-containers {
	width: 11%;
	height: 100%;
}


a, #account-icon-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
}
</style>