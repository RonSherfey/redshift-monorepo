import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Icon,
  Input,
  notification,
  Popover,
  Progress,
  Radio,
  Row,
  Select,
  Statistic,
} from 'ant-design-vue';
import Vue from 'vue';

Vue.use(Icon);
Vue.use(Button);
Vue.use(Card);
Vue.use(Col);
Vue.use(Divider);
Vue.use(Form);
Vue.use(Input);
Vue.use(Popover);
Vue.use(Progress);
Vue.use(Radio);
Vue.use(Row);
Vue.use(Select);
Vue.use(Statistic);

notification.config({
  placement: 'topRight',
  top: '20px',
  duration: 3,
});
