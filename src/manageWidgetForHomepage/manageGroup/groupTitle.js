import React from 'react';
import Checkbox from 'bee/checkbox';
import Message from 'bee/message';
import { connect } from 'react-redux';
import Menu, { Item as MenuItem } from 'bee/menus';
import Dropdown from 'bee/dropdown';
import { ButtonCheckClose, ButtonCheckSelected } from '../../button';
import { mapStateToProps } from '../../utils';
import manageActions from '../core/action';
const { addGroup,
  updateGroupList,
  selectGroupActions,
  selectListActions,
  delectGroup,
  setEditonlyId,
  setDragInputState,
  renameGroup,
  moveBottomGroup,
  moveTopGroup } = manageActions;
import languagesJSON from 'yutils/languages';
import Icon from '../../icon';

import {
  widgetTitle,
  newGroupName,
  titleInputArea,
  iconBox,
  btn,
  newGroupName_focus,
  newGroupName_blur,
  widgetTitleInit,
  check_group,
  noChildStyle
} from './style.css';
@connect(
  mapStateToProps(
    "manageList",
    "layout",
    "selectGroup",
    "currEditonlyId",
    "selectList",
    {
      namespace: 'managewidget',
    },
  ),
  {
    addGroup,
    updateGroupList,
    selectGroupActions,
    selectListActions,
    delectGroup,
    setEditonlyId,
    setDragInputState,
    renameGroup,
    moveBottomGroup,
    moveTopGroup
  },
)
export default class GroupTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupName: "",
      inFoucs: false,
      showModal: false,
      selectGroup: [],
      selectList: [],
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      this.props.currEditonlyId !== nextProps.currEditonlyId &&
      this.props.data.isNew
    ) {
      this.props.renameGroup({
        id: this.props.data.widgetId,
        name: this.state.groupName == "" ? this.props.data.widgetName : this.state.groupName,
        dontChangeCurrEditonlyId: true,
      });
      this.setState({
        inFoucs: false
      })
    }
  }

  // 点击取消编辑分组按钮
  renameGroupCancel = (index) => {
    const { renameGroup, setEditonlyId } = this.props;
    const {
      data: {
        widgetName: groupName,
      },
    } = this.props;
    const stateGroupName = this.state.groupName;
    this.setState({
      groupName: groupName ? groupName : stateGroupName,
    });
    setEditonlyId("");
    if (!groupName) {
      renameGroup({
        index,
        name: stateGroupName,
      });
    }
    this.setState({
      inFoucs: false,
    })
  }
  // 点击按钮执行 action   重新构造
  renameGroupFn = (index) => {
    const { renameGroup, manageList } = this.props;
    const name = this.state.groupName;
    if (name == manageList[index].widgetName) {
      this.renameGroupCancel(index);
      return false;
    }
    let widgetNameArr = manageList.map((item, index) => {
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
    });
    this.renameGroupCancel(index);
  }
  // 打开编辑分组形态
  openRenameGroupFn = (id) => {
    const { setEditonlyId } = this.props;
    setEditonlyId(id);
    setTimeout(() => {
      this.refs.groupName.focus();
      this.refs.groupName.select();
    }, 0);
    this.setState({
      inFoucs: false,
    })
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
  handleBlur = () => {
    this.setState({
      inFoucs: false,
    });
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
    const { manageList } = this.props;
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
  renderTitle = () => {
    const { data: {
      widgetId,
      widgetName,
      children,
    }, currEditonlyId, groupID, index, selectGroup } = this.props;
    const {
      inFoucs,
      groupName,
    } = this.state;
    const checkType = selectGroup.indexOf(index) > -1 ? true : false;
    let groupTitle;
    if (currEditonlyId == groupID) {
      groupTitle = (
        <div className={widgetTitle} >
          <div className={titleInputArea}>
            <input
              className={`${inFoucs ? newGroupName_focus : newGroupName_blur} ${newGroupName} input`}
              value={groupName}
              maxLength="4"
              autoFocus="autofocus"
              onChange={this.editGroupName}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              placeholder={languagesJSON.groupName_max_words_four}
              ref="groupName" />
          </div>
          <ButtonCheckSelected id={`${widgetId}_btn`} className={btn} onClick={() => { this.renameGroupFn(index) }}><Icon type="right"></Icon></ButtonCheckSelected>
          <ButtonCheckClose className={btn} onClick={() => { this.renameGroupCancel(index) }}><Icon type="cancel"></Icon></ButtonCheckClose>
        </div>
      );
    } else {
      groupTitle = (
        // um-box-justify
        <div className={`${widgetTitle} ${widgetTitleInit} `} >
          <div className={check_group}>
            <Checkbox checked={checkType} onChange={(e) => { this.selectFn(e, index) }}>{widgetName}</Checkbox>
            {
              (languagesJSON.noDataGroup && children.length === 0)
                ?
                <span className={noChildStyle}><Icon type="notice" />{languagesJSON.noDataGroup}</span>
                :
                null
            }
          </div>
          <div>
            <div className={iconBox}>
              <Icon title={languagesJSON.rename_group} type="record" onClick={() => { this.openRenameGroupFn(groupID) }} />
            </div>
            {this.renderDrop(index)}
          </div>
        </div>
      );
    }
    return groupTitle;
  }
  render() {
    return (<div>{this.renderTitle()}</div>)
  }
}

