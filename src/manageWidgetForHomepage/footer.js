import React, { Component } from 'react';
import {ButtonDefaultLine,ButtonBrand,ButtonDefaultAlpha} from 'pub-comp/button';
import { um_footer, umBoxJustify, batchArea, saveArea } from './style.css';

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
    'currEditonlyId',
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
export default class Footer extends Component{
  constructor(props){
    super(props);
 
  }
  
  render(){
    var {
      selectList,
      openGroupTo,
      isEdit,
      save,
      popOpenCancel,
      languagesJSON,
      currEditonlyId
    } = this.props;

    return (
        <div className={um_footer}>
          <div className={umBoxJustify}>
             {/* <div className={`${batchArea}  horizontalParent`}>
              <ButtonDefaultLine onClick={this.props.batchDelectFn} disabled={selectList.length ? false:true} className="horizontal">{languagesJSON.delete}</ButtonDefaultLine>
              <ButtonDefaultLine onClick={this.props.openGroupTo} disabled={selectList.length ? false:true} >{languagesJSON.moveTo}</ButtonDefaultLine>
            </div> */}
            <div className={`${saveArea}  horizontalParent`}>
              <ButtonBrand disabled={!isEdit} onClick={()=>{
                console.log('执行了保存!!!!!');
                this.props.save()
                }}>{languagesJSON.save}</ButtonBrand>
              <ButtonDefaultLine onClick={this.props.popOpenCancel} >{languagesJSON.cancel}</ButtonDefaultLine>
              {/*<ButtonDefaultLine onClick={this.goBack}>取消</ButtonDefaultLine>*/}
            </div>
          </div>
        </div>
    )
  }
}




