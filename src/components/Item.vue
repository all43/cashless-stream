<template>
	<div class="item">
  		<p>{{ item.title }}</p>
  		<p class="amount">{{ finalValue }}</p>
  	</div>
</template>

<script>
import { toPeriod } from '../services/calc';
export default {
  name: 'Item',
  props: {
    item: Object,
    selectedPeriod: String,
  },
  computed: {
  	finalValue: function(){
  		return toPeriod(this.item.value, this.item.period, this.selectedPeriod);
  	}
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
