import React, { Component } from 'react';
import Wrapper from './wrapper'
import store from './core/index'
import { Provider } from 'react-redux';
import {trigger,on} from './utils'


 class CreateManageModule extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            <Provider store={store}>
                <div>
                    <Wrapper {...this.props} trigger={trigger} on={on}/>
                </div>
            </Provider>
            </div>
        );
    }
}
export default CreateManageModule
