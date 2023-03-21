<template>
	<a
		:href="url"
		:data-id="id"
		:data-format="format"
		:data-city="city"
		:data-state="state"
		:data-freq="freq"
		:data-calls="calls"
		:data-band="band"
		target="_blank"
		rel="noopener"
	>
		<StationLogo v-if="image.length"
			:src="image.replace('http://', '//')"
			:alt="'Logo for ' + id"
		/>
		<h3>{{ id }}</h3>
		<div class="crsg-sf-locale">{{ city }}, {{ state }}</div>
		<div class="crsg-sf-details">{{ freq }}</div>
		<div class="crsg-sf-details">{{ calls }} {{ band }}</div>
		<div class="crsg-sf-details">{{ format }}</div>
	</a>
</template>

<script>
import StationLogo from './StationLogo.vue'
export default {
	name: 'Station',
	components: { StationLogo },
	props: {
		url: null,
		id: null,
		format: null,
		city: null,
		state: null,
		freq: null,
		calls: null,
		band: null,
		image: null
	}
}
</script>