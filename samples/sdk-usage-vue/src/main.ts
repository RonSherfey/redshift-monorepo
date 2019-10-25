import '@/bootstrap-ant-design';
import Vue from 'vue';
import App from './components/app';
import './filters';
import router from './router';

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
