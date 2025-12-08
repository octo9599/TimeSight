<script setup></script>

<template>
	<div id="topbar-container">
		<a href="/">
			<img class="icons" id="eye-icon" src="@/assets/images/Logo.png" alt="TimeSight Logo">
		</a>
		<!-- janky but working way to make T and S colored differently -->
		<h1><span class="highlighted">T</span>ime<span class="highlighted">S</span>ight</h1>
		<!-- actual account icon will go here once available-->
		<img class="icons" id="acc-icon" src="@/assets/images/TEMPORARY-Account-Icon.png" alt="Account Menu">
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

#acc-icon {
	width: max-content;
	height: max-content;
	/*margin: 0 10px;*/
}

#eye-icon {
	height: min-content;
	width: 170px;
	/*margin: 0 10px;*/
}

#topbar-container {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	background-color: var(--main-dark);
	border-bottom: 3px var(--text-dark) solid;
	height: 12vh;
}


img.icons {
	margin: 0 15px;
}


</style>
