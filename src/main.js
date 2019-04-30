import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false
Vue.filter('formatCurrency', function (currencyObject) {
	return currencyObject.money.toFormat(currencyObject.format);
})

new Vue({
  render: h => h(App),
}).$mount('#app')
