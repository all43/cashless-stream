<template>
  <div class="container">
    <div>
      <select v-model="selectedPeriod">
        <option value="annual">Year</option>
        <option value="monthly">Month</option>
        <option value="daily">Day</option>
        <option value="everyMinute">Minute</option>
        <option value="everySecond">Second</option>
        <option value="everyMillisecond">Millisecond</option>
      </select>
    </div>
    <div class="items">
      <div class="in">
        <h1>Income</h1>
        <Item v-for="item in inc" :item="item" :selectedPeriod="selectedPeriod" />
      </div>
      <div class="out">
        <h1>Expenses</h1>
        <Item v-for="item in out" :item="item" :selectedPeriod="selectedPeriod" />
      </div>
    </div>
    <div class="total">
      <div class="in">
        {{ totalIn }}
      </div>
      <div class="out">
        {{ totalOut }}
      </div>
    </div>
    <div class="balance">
      <div>
        balance
      </div>
    </div>
  </div>
</template>

<script>
import Item from './Item.vue';
import { total } from '../services/calc';
import accountData from '../json/account.json';
export default {
  data: () => ({...accountData, selectedPeriod: 'monthly'}),
  name: 'Dashboard',
  props: {
    msg: String
  },
  components: {
    Item,
  },
  computed: {
    totalIn: function(){
      return total(this.inc, this.selectedPeriod);
    },
    totalOut: function(){
      return total(this.out, this.selectedPeriod);
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div.container {display: inline-flex; width: 60%; flex-direction: column;}
  div.items, div.total, div.balance {display: flex;}
  div.items > div, div.total > div, div.balance > div {border: 1px solid gray; padding: 14px; flex-grow: 1; flex-basis: 0;}
</style>
