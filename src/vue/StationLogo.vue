<template>
	<figure v-if="src.length">
		<v-lazy-image
			:src="src"
			:src-placeholder="placeholder"
			:alt="alt"
		/>
	</figure>
</template>

<script>
import 'intersection-observer';
import VLazyImage from "/node_modules/v-lazy-image/v2";
export default {
	components: { VLazyImage },
	props: {
		src: null,
		placeholder: "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==",
		alt: null
	}
}
</script>