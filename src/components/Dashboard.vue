<template>
  <div class="container">
    <div class="items">
      <div class="in">
        <h1>Income</h1>
        <Item v-for="item in inc" :item="item" />
      </div>
      <div class="out">
        <h1>Expenses</h1>
        <Item v-for="item in out" :item="item" />
      </div>
    </div>
    <div class="total">
      <div class="in">
        total in
      </div>
      <div class="out">
        total out
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
import accountData from '../json/account.json';
export default {
  data: () => accountData,
  name: 'Dashboard',
  props: {
    msg: String
  },
  components: {
    Item,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  div.container {display: inline-flex; width: 60%; flex-direction: column;}
  div.items, div.total, div.balance {display: flex;}
  div.items > div, div.total > div, div.balance > div {border: 1px solid gray; padding: 14px; flex-grow: 1; flex-basis: 0;}
</style>
