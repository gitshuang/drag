import React, { Component } from 'react';
import PopDialog from 'pub-comp/pop';
import { manager_save_pop } from './style.css';

import { connect } from 'react-redux';

import manageActions from './core/action';
const { returnDefaultState,updateGroupList,setManageList,emptySelectGroup } = manageActions;
import { mapStateToProps } from '../utils';

//import rootActions from 'store/root/actions';
//const { requestStart, requestSuccess, requestError } = rootActions;
@connect(
  mapStateToProps(  
    'manageList',
    'isEdit',
      {
          namespace: 'managewidget',
      },
  ),
  {
      returnDefaultState,
      updateGroupList,
      setManageList,
      emptySelectGroup
  }
)
export default class PopDialogComp extends Component{
  constructor(props){
    super(props);
  }

  static defaultProps = {}

  render(){
    const {languagesJSON} = this.props;
    const pop_btn = [
        {label:languagesJSON.confirm,fun:this.props.batchDelectFn,className:""},
        {label:languagesJSON.cancel,fun:this.props.popClose,className:""}
      ]
      const pop_btn2 = [
        {label:languagesJSON.cancel,fun:this.props.popCloseCancel,type:"u8cDefault"},
        {label:languagesJSON.notSave,fun:this.props.cancel,type:"u8c"},
        {label:languagesJSON.save,fun:this.props.save,type:"u8cPrimary"},
      ]
    return (
      <div>
        <PopDialog className="pop_dialog_delete" type="delete" show = { this.props.showModal } close={this.props.popClose} btns={pop_btn} >
          <div>
            {/*<span>您确认要批量删除吗?</span>*/}
            <span>{languagesJSON.confirm_to_delete_batch}</span>
          </div>
        </PopDialog>
        <PopDialog  className={ manager_save_pop } type="warning" show = { this.props.showCancelModal } close={this.props.popCloseCancel} btns={pop_btn2} title={languagesJSON.save_latest_or_not} >
          <div>
            {/*<span>点击不保存，则最新修改将丢失</span>*/}
            <span>{languagesJSON.notSave_to_lose_new_modify}</span>
          </div>
        </PopDialog>
      </div>
    )
  }
}




