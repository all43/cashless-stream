<template>
  <span>{{ accumulatedValue | formatCurrency }}</span>
</template>

<script>
export default {
  name: 'Accumulator',
  props: {
    time: Number,
    moneyPerPeriod: Object,
  },
  data: function(){
    return {
      accumulatedValue: {...this.moneyPerPeriod},
    }
  },
  watch: {
    time: function(currentTime, prevTime){
      const timeDiff = currentTime - prevTime;
      const amountToAdd = this.moneyPerPeriod.money.multiply(timeDiff);
      this.accumulatedValue.money = this.accumulatedValue.money.add(amountToAdd);
      // this.$forceUpdate();
    },
  },
  updated: ()=> {
    console.log('acc updated');
  }
}
</script>

<style scoped>

</style>
