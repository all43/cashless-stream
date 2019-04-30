<template>
  <div class="container">
    <div class="controls">
        <form>
        <div>
          <select v-model="selectedPeriod">
            <option value="annual">Year</option>
            <option value="monthly">Month</option>
            <option value="daily">Day</option>
            <option value="everyMinute">Minute</option>
            <option value="everySecond">Second</option>
          </select>
        </div>
        <div>
          <input type="checkbox" id="visualize" v-model="visualize" />
          <label for="visualize">Visualize</label>
        </div>
        <div>
          <input type="checkbox" id="projections" v-model="projections" />
          <label for="projections">Include projections</label>
        </div>
      </form>
    </div>
    <div class="row">
      <div class="in">
        <h1>Income</h1>
        <Item v-for="item in filteredInc" :item="item" :selectedPeriod="selectedPeriod" />
      </div>
      <div class="out">
        <h1>Expenses</h1>
        <Item v-for="item in filteredOut" :item="item" :selectedPeriod="selectedPeriod" />
      </div>
    </div>
    <div class="row">
      <div class="in">
        {{ totalIn | formatCurrency }}
      </div>
      <div class="out">
        {{ totalOut | formatCurrency }}
      </div>
    </div>
    <div class="row balance">
      <div>
        {{ balance | formatCurrency }}
      </div>
    </div>
    <template v-if="visualize">
    <div class="row">
      <div class="in">
        <Accumulator :moneyPerPeriod="tickIn" :time="time" />
      </div>
      <div class="out">
        <Accumulator :moneyPerPeriod="tickOut" :time="time" />
      </div>
    </div>
    <div class="row balance realtime">
      <div>
        <Accumulator :moneyPerPeriod="tickBalance" :time="time" />
      </div>
    </div>
    </template>
  </div>
</template>

<script>
import Item from './Item.vue';
import Accumulator from './Accumulator.vue';
import { total } from '../services/calc';
import accountData from '../json/account.json';
const filterArray = (arr, includeProjections) => arr.filter(
  (el) => (el.type !== 'projected' || includeProjections)
  );
export default {
  data: () => ({
    ...accountData,
    visualize: false,
    projections: true,
    tickPeriod: 'everyMillisecond',
    selectedPeriod: 'monthly',
    time: new Date(),
  }),
  name: 'Dashboard',
  props: {
    msg: String,
  },
  components: {
    Item,
    Accumulator,
  },
  mounted: function(){
    const self = this;
    const updateTime = function(){
      self.time = new Date().getTime();
    };
    setInterval(updateTime, 20);
  },
  computed: {
    totalIn: function(){
      return total(this.filteredInc, this.selectedPeriod);
    },
    totalOut: function(){
      return total(this.filteredOut, this.selectedPeriod);
    },
    balance: function(){
      return {money: this.totalIn.money.subtract(this.totalOut.money), format: this.totalIn.format};
    },
    tickIn: function(){
      return total(this.filteredInc, this.tickPeriod);
    },
    tickOut: function(){
      return total(this.filteredOut, this.tickPeriod);
    },
    tickBalance: function(){
      return {money: this.tickIn.money.subtract(this.tickOut.money), format: this.tickIn.format};
    },
    filteredInc: function(){
      return filterArray(accountData.inc, this.projections);
    },
    filteredOut: function(){
      return filterArray(accountData.out, this.projections);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  .controls{
    div, & select{padding: 5px; font-size: larger;}
  }
  div.container {display: inline-flex; min-width: 380px; flex-direction: column;}
  div.row {display: flex;}
  .in{background-color: #E0E0FF}
  .out{background-color: #FFE0E0}
  div.row > div {border: 1px solid lightgray; padding: 14px; flex-grow: 1; flex-basis: 0;}
  div.balance div{text-align: center; font-size: larger; font-weight: bolder; background-color: #E9E9E9}
</style>
