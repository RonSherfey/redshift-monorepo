import Vue from 'vue';
import Router from 'vue-router';
import { Payment } from './components/pages/payment';
import { Start } from './components/pages/start';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'start',
      component: Start,
    },
    {
      path: '/payment',
      name: 'payment',
      component: Payment,
    },
  ],
});
