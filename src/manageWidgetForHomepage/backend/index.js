import MouseBackend from './MouseBackend'
import HTML5BackendGroup from 'react-dnd-html5-backend';
// import MouseBackEnd from 'react-dnd-mouse-backend'


const createMouseBackend = (manager) => new MouseBackend(manager)

const judgeIfSupH5 = () => {
    if (window.hasOwnProperty('applicationCache') && window.hasOwnProperty('ondrag')) {
      return true;
    } else {
      return false;
    }  
}

var judgedBackend = judgeIfSupH5()?HTML5BackendGroup:createMouseBackend;

export default judgedBackend;