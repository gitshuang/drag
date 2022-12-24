import React,{Component} from 'react';
import Menu, { Item as MenuItem } from 'bee/menus';
import Message from 'bee/message';
import Icon from 'pub-comp/icon';
import Dropdown from 'bee/dropdown';



export default class GroupItem extends Component {
    // 打开编辑分组形态
  openRenameGroupFn = (id) => {
    const { setEditonlyId,roleEditMultiLang } = this.props;
    setEditonlyId(id);
    setTimeout(() => {
      if(roleEditMultiLang){//应用在角色首页时
          document.getElementById('widgetNameMultiLangText').focus()
          document.getElementById('widgetNameMultiLangText').select()
        //   document.getElementById('widgetNameMultiLangText').addEventListener('keydown',(e)=>{
        //     if (e.target.value.length >= 4) e.preventDefault();
        // })
      }else{
        this.groupName.focus();
        this.groupName.select();
      }
    }, 0);
    this.setState({
      inFoucs: false,
    })
  }
  // 点击取消编辑分组按钮
  renameGroupCancel = (index) => {

    const { renameGroup, setEditonlyId,roleEditMultiLang } = this.props;
    const {
      data: {
        widgetName: groupName,
      },
    } = this.props;
    const stateGroupName = this.state.groupName;
    const widgetNameMultiLangText = this.state.widgetNameMultiLangText
    this.setState({
      groupName: groupName ? groupName : stateGroupName,
    });
    setEditonlyId("");
    if (!groupName) {
      renameGroup({
        index,
        name: stateGroupName,
        widgetNameMultiLangText,
        roleEditMultiLang
      });
    }
    this.setState({
      inFoucs: false,
    })
  }
  // 点击按钮执行 action   重新构造
  renameGroupFn = (index) => {
    const { renameGroup, manageList, languagesJSON,roleEditMultiLang } = this.props;
    const {groupName:name,widgetNameMultiLangText} = this.state;
    //如果名字不变就不更新,不应用在角色首页,因为有多语
    if (!roleEditMultiLang&&name == manageList[index].widgetName) {
      this.renameGroupCancel(index);
      return false;
    }
    let widgetExpectCurrent = manageList.filter((item, indexinner) => {
        return !indexinner==index
    });
    let widgetNameArr = widgetExpectCurrent.map((item, index) => {
        return item.widgetName
    });
    if (widgetNameArr.includes(name)) {
      Message.create({
        content: languagesJSON.group_name_exists,
        duration: 1.5,
        position: 'topLeft',
        color: "warning",
        style: { height: 'auto' }
      });
      return false;
    }
    renameGroup({
      index,
      name,
      widgetNameMultiLangText,
      roleEditMultiLang
    });
    this.renameGroupCancel(index);
  }
  //点击清空输入框
  clearInput = () => {
    this.setState({
      groupName: "",
    });
  }
  // 输入框的更改
  editGroupName = (e) => {
    let _groupName = e.target.value;
    // _groupName = getStrLenSubstr(_groupName,11,21,true)
    this.setState({
      groupName: _groupName
    })
  }
  //输入框聚焦更改背景颜色
  handleFocus = () => {
    this.setState({
      inFoucs: true,
    });
    const { setDragInputState, dragState } = this.props;
    if (!dragState) return;
    setDragInputState(false);
  }
  //输入框失焦
  handleBlur = (index) => {
    this.setState({
      inFoucs: false,
    });
    //this.renameGroupFn(index);
    const { setDragInputState, dragState } = this.props;
    if (dragState) return;
    setDragInputState(true);
  }

  // 选择框  选择
  selectFn = (e, index) => {
    let {
      selectListActions,
      manageList,
      selectList,
      selectGroup,
      selectGroupActions,
    } = this.props;
    //const checkFlag = e.target.checked;
    // 换成checkbox插件
    const checkFlag = e;
    const aa = manageList[index].children.map((item, index) => {
      return item.widgetId;
    });
    if (checkFlag) {
      selectGroup.push(index);
      selectGroupActions(selectGroup);
      if (!!window.ActiveXObject || "ActiveXObject" in window) { //ie?
        selectList = Array.from(selectList.concat(aa).distinct());
      } else {
        selectList = Array.from(new Set(selectList.concat(aa)));
      }

    } else {
      selectList = selectList.filter(v => !aa.includes(v));
      const selectGroup2 = selectGroup.filter((item, i) => {
        return index !== item;
      });
      selectGroupActions(selectGroup2);
    }
    selectListActions(selectList);
  }
  popOpen = () => {
    this.setState({
      showModal: true
    });
  }
  popClose = () => {
    this.setState({
      showModal: false
    });
  }
  // 上移分组
  moveTopFn = (index) => {
    const { moveTopGroup } = this.props;
    moveTopGroup(index);
  }
  // 下移分组
  moveBottomFn = (index) => {
    const { moveBottomGroup } = this.props;
    moveBottomGroup(index);
  }
  // 删除群组
  delectGroupFn = (index) => {
    const { delectGroup } = this.props;
    delectGroup(index);
  }
  // 添加新分组
  addGroupFn(index) {
    const { addGroup } = this.props;
    addGroup({ index });
  }
  // menu组件 方法
  onDropSelect = (index) => ({ key }) => {
    switch (key) {
      case '1':
        this.moveBottomFn(index);
        break;
      case '2':
        this.moveTopFn(index);
        break;
      default:
        this.delectGroupFn(index);
        break;
    }
  }

  renderDrop = (index) => {
    const { manageList, languagesJSON } = this.props;
    let menu = (
      <Menu onClick={this.onDropSelect(index)}>
        {
          index !== manageList.length - 1 ? (
            <MenuItem key="1">{languagesJSON.move_down}</MenuItem>
          ) : null
        }
        {
          index ? (
            <MenuItem key="2">{languagesJSON.move_up}</MenuItem>
          ) : null
        }
        <MenuItem key="3">{languagesJSON.delete}</MenuItem>
      </Menu>
    );

    return (
      <Dropdown
        trigger={['click']}
        overlay={menu}
        animation="slide-up" > 
        <div><Icon title={languagesJSON.more} type="more" /></div>
      </Dropdown>
    )
  }
}