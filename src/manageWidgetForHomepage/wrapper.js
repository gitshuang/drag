import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import Content from './content'
import Footer from './footer'
import PopDialogComp from './popDialogComp'
import judgedBackend from './backend';
import { DragDropContext } from 'react-dnd';
import Sider from './sider';
import CustomDragLayer from './dragLayer/customDragLayer.js';
import { connect } from 'react-redux';
import store from './core/index'

import manageActions from './core/action';
const { returnDefaultState,updateGroupList,emptySelectGroup,setEditState,moveGroup } = manageActions;
import { mapStateToProps } from '../utils';


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
      emptySelectGroup,
      setEditState,
      moveGroup
  }
)
class Wrapper extends Component {
  constructor(props) {
    super(props);
    
    this.state = {
      showModal: false,
      showCancelModal: false,
    };
    this.goToLocation = '';
    this.configBack = false;
  }
  static defaultProps = {
		isFooterDisplay: true
	  };
  componentWillUnmount() {
    const { returnDefaultState } = this.props;
    returnDefaultState();
  }

  componentWillMount(){
    const {getRef} = this.props;
    if(getRef){
      getRef(this)
  }
  }
  moveGroupDrag = (id, afterId) => {
    const { moveGroup } = this.props;
    moveGroup({ id, afterId });
  }
 
  // 批量删除
  batchDelectFn = () => {
    const { batchDelect } = this.props;
    batchDelect();
    this.popClose();
  }

  openGroupTo = () => {
    const { openBatchMove } = this.props;
    openBatchMove();
  }
  // 打开删除的弹窗
  popOpen = () => {
    this.setState({
      showModal: true,
    });
  }
  // 关闭删除的弹窗
  popClose = () => {
    this.setState({
      showModal: false,
    });
  }

  
  componentDidMount(){
    
    const { history } = this.props;
    if(history!=undefined){
      history.block((location) => {
        //const { isEdit } = this.props;
        let sta = store.getState();
        const {isEdit} = sta;
        this.goToLocation = location.pathname;
        if ((location.pathname !== this.props.match.path) && isEdit && !this.configBack) {
          this.setState({
            showCancelModal: true,
          });
        }
      });
    }
    
  }
   //  保存
   save = () => {
    const {
      manageList,
      save,
      currEditonlyId,
      trigger
    } = this.props;
    if (currEditonlyId) {//this.checkBtn
      //this.checkBtn.click();
      //document.getElementById(`${currEditonlyId}_btn`).click();
      trigger({
        type:`${currEditonlyId}_btn`
      });
    }
    
      save(manageList).then(({ error, payload }) => {
        if (error) {
          //requestError(payload);
  
        } else {
          this.goBack();
        }
        this.popCloseCancel();
      });
    
  }
  // 取消
  cancel = () => {
    const {
      // isEdit,
      setEditState,
    } = this.props;
    setEditState(false);
    this.popCloseCancel();
    this.goBack();
  }
  // 返回操作
  goBack = () => {
    this.configBack = true;
    const { emptySelectGroup,goBack } = this.props;
    emptySelectGroup();
    //this.props.history.replace(this.goToLocation);
    if(goBack){
      goBack();
      return
    }
    this.props.history.go(-1);
  }

    // 打开取消的弹窗
    popOpenCancel = () => {
      //const { isEdit } = this.props;
      let sta = store.getState();
      const {isEdit} = sta;
      if (isEdit) {
        this.setState({
          showCancelModal: true,
        });
      } else {
        this.goBack();
      }
    }
    // 关闭取消的弹窗
    popCloseCancel = () => {
      this.setState({
        showCancelModal: false,
      });
    }
  render() {
   const {languagesJSON,isEdit,isFooterDisplay,roleEdit,acInputLocal,locale,roleEditMultiLang,on} = this.props;
    const {showModal,showCancelModal} = this.state;
    var popDialogProps = {
      save:this.save,
      showModal,
      showCancelModal,
      popClose:this.popClose,
      batchDelectFn:this.batchDelectFn,      
      cancel:this.cancel,
      popCloseCancel:this.popCloseCancel,
    }
    var footerProps = {
      batchDelectFn:this.batchDelectFn,
      openGroupTo:this.openGroupTo,
      isEdit,
      save:this.save,
      popOpenCancel:this.popOpenCancel,
      
    }
    return (
      <div>
       <div style={{display:'flex',position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        }}  >
          {/* <div style={{width:300}}>sider</div> */}
          {/* <BatchMove {...batchMoveRedux} languagesJSON={languagesJSON}/> */}

          <Sider languagesJSON={languagesJSON} menuList={this.props.menuList}/>
          <Content languagesJSON={languagesJSON} 
          groupList = {this.props.groupList} 
          moveGroupDrag={this.moveGroupDrag} 
          roleEdit={roleEdit}
          roleEditMultiLang={roleEditMultiLang}
          locale={locale}
          acInputLocal={acInputLocal}
          on = {on}
          />
          
          
          <PopDialogComp {...popDialogProps} languagesJSON={languagesJSON}/>
          <CustomDragLayer/> 
      </div>
     {isFooterDisplay?<Footer languagesJSON={languagesJSON} {...footerProps} />:null}
     </div>
    );
  }
}

export default DragDropContext(judgedBackend)(Wrapper);




