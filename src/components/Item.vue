<template>
	<div class="item">
  		<p>{{ item.title }}</p>
  		<p class="amount">{{ item.value }}</p>
  	</div>
</template>

<script>
export default {
  name: 'Item',
  props: {
    item: Object
  }
}
</script>

<style scoped>
	.item{
		border-bottom: 1px dashed;
		display: flex;
		justify-content: space-between;
	}
	p.amount{font-weight: bold;}
</style>
