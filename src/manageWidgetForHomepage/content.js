import React, { Component } from 'react';
import {ButtonDefaultAlpha} from 'pub-comp/button';
import Icon from 'pub-comp/icon';
import ManageGroup from './manageGroup';
import _ from 'lodash';
import manageActions from './core/action';
const { updateShadowCard, addGroup,updateGroupList,updateLayout,getManageList} = manageActions;
import { layoutCheck } from './collision';
import { compactLayout, compactLayoutHorizontal } from './compact';
import * as utilService from './utils';
import {addWidthAndHeight} from '../utils'

import {
  um_content,
  addBtn,
  addGroupBtn,
} from './style.css';

import { connect } from 'react-redux';
import { mapStateToProps } from '../utils';

@connect(
	mapStateToProps(
    "manageList",
    "shadowCard",
    "layout",
    "defaultLayout",
    'selectGroup',
    'dragState',
		{
			namespace: 'managewidget',
    },
	),{
    updateShadowCard,
    addGroup,
    updateGroupList,
    updateLayout,
    getManageList
  }
)
export default class Content extends Component{
  constructor(props){
    super(props);
  }
/**
	 * 移动组的顺序
	 * @param {Number} dragIndex 拖拽的组对象的index值
	 * @param {Number} hoverIndex 拖拽中鼠标悬浮的组对象的index值
	**/
	moveGroupItem = (dragIndex, hoverIndex) => {
		let { manageList } = this.props;
		manageList = _.cloneDeep(manageList);
		const dragCard = manageList[dragIndex];
		manageList.splice(dragIndex, 1);
		manageList.splice(hoverIndex, 0, dragCard);
		this.props.updateGroupList({manageList,isEdit:true});
	};
/**
	 * 拖拽中卡片在组上移动
	 * @param {Object} dragItem 拖拽中的对象
	 * @param {Object} hoverItem 拖拽中鼠标悬浮的对象
	 * @param {Number} x 当前元素所在的网页的x轴位置，单位为px
	 * @param {Number} y 当前元素所在的网页的y轴位置，单位为px
	**/
	moveCardInGroupItem = (dragItem, hoverItem, x, y) => {
    
		let axis = 'gridx';
		let manageList = this.props.manageList;
    let shadowCard = this.props.shadowCard;
		const { margin, containerWidth, col, rowHeight } = this.props.layout;
    //计算当前所在的网格坐标
		const { gridX, gridY } = utilService.calGridXY(x, y, shadowCard.width, margin, containerWidth, col, rowHeight);
    if (gridX === shadowCard.gridx && gridY === shadowCard.gridy) {
			return;
    }
    
		let groupIndex = hoverItem.index;
		//先判断组内是否存在相同的卡片
		const widgetId = shadowCard.widgetId;
		const isContain = utilService.checkCardContainInGroup(manageList[groupIndex], widgetId);

		if (isContain) {
			return;
    }
		//删除阴影的卡片
		_.forEach(manageList, (g, index) => {
			_.remove(g.children, (a) => {
				return a.isShadow === true;
			});
		});
		shadowCard = { ...shadowCard, gridx: gridX, gridy: gridY };
		//添加阴影的卡片
		manageList[groupIndex].children.push(shadowCard);
    //获得当前分组内最新的layout布局
    
		const newlayout = layoutCheck(
			manageList[groupIndex].children,
			shadowCard,
			shadowCard.widgetId,
			shadowCard.widgetId,
			axis
    );

		//压缩当前分组内的layout布局
		let compactedLayout;
		if(axis === 'gridx'){
			compactedLayout = compactLayoutHorizontal(newlayout, this.props.layout.col, widgetId);
		}else if(axis === 'gridy'){
			compactedLayout = compactLayout(newlayout, shadowCard);
		}
    //更新group对象
    manageList[groupIndex].children = compactedLayout;
    this.props.updateShadowCard(shadowCard);
    this.props.updateGroupList(manageList);

  };
  //当页面加载完成，获得卡片容器宽度
	handleLoad = () => {
    let fn;
    if(this.props.roleEdit){//当用在角色编辑时
      fn = () => {
        let clientWidth;
        const containerDom = document.querySelector('#widget-container');
        if (containerDom) {
          clientWidth = containerDom.clientWidth;
        } else {
          const firstAddButton = document.querySelector('#first-add');
          if (firstAddButton) {
            clientWidth = firstAddButton.clientWidth - 10;
          } else {
            return;
          }
        }
        const defaultCalWidth = this.props.defaultLayout.calWidth;
        const { containerPadding, margin } = this.props.layout;
        let layout = _.cloneDeep(this.props.layout);
        const col = utilService.calColCount(148, clientWidth, containerPadding, margin);//取148是为了和左侧拖拽时的阴影对应
        const calWidth = 148;
  
        let { manageList } = this.props;
        manageList = _.cloneDeep(manageList);
        _.forEach(manageList, (g) => {
          let compactedLayout = compactLayoutHorizontal(g.children, col);
          g.children = compactedLayout;
        });
  
        layout.calWidth = layout.rowHeight = calWidth;
        layout.col = col;
        layout.containerWidth = clientWidth;
        this.props.updateGroupList(manageList);
        this.props.updateLayout(layout);
      }
    }else{
      fn = () => {
        let clientWidth;
        const containerDom = document.querySelector('#widget-container');
        if (containerDom) {
          clientWidth = containerDom.clientWidth;
        } else {
          const firstAddButton = document.querySelector('#first-add');
          if (firstAddButton) {
            clientWidth = firstAddButton.clientWidth - 10;
          } else {
            return;
          }
        }
        const defaultCalWidth = this.props.defaultLayout.calWidth;
        const { containerPadding, margin } = this.props.layout;
        let layout = _.cloneDeep(this.props.layout);
        const windowWidth = window.innerWidth - 60 * 2;
        const col = utilService.calColCount(defaultCalWidth, windowWidth, containerPadding, margin);
        const calWidth = utilService.calColWidth(clientWidth, col, containerPadding, margin);
  
        let { manageList } = this.props;
        manageList = _.cloneDeep(manageList);
        _.forEach(manageList, (g) => {
          let compactedLayout = compactLayoutHorizontal(g.children, col);
          g.children = compactedLayout;
        });
  
        layout.calWidth = layout.rowHeight = calWidth;
        layout.col = col;
        layout.containerWidth = clientWidth;
        this.props.updateGroupList(manageList);
        this.props.updateLayout(layout);
      }
    }
		
    
    
		utilService.DeferFn(fn)
  };
  /**
	 * 释放卡片到分组
	 * @param {Object} dragItem 拖拽的卡片对象
	 * @param {Object} dropItem 释放的目标组对象
	**/
	onCardDropInGroupItem = (dragItem, dropItem) => {
		let { manageList } = this.props;
		manageList = _.cloneDeep(manageList);
		//将所有分组内的阴影卡片设为非阴影  
		utilService.setPropertyValueForCards(manageList, 'isShadow', false);
		//目标组内重新横向压缩布局
		_.forEach(manageList, (g, targetGroupIndex) => {
			let compactedLayout = compactLayoutHorizontal(manageList[targetGroupIndex].children, this.props.layout.col);
			manageList[targetGroupIndex].children = compactedLayout;
		});

		this.props.updateGroupList({manageList,isEdit:true});
		this.props.updateShadowCard({});  
  };
  
  /**
	 * 释放sider区中选中的所有卡片CardList到分组中
	 * @param {Object} dragItem 拖拽sider区中选中的所有卡片
	 * @param {Object} dropItem 释放的目标组对象
	**/
	onCardListDropInGroupItem = (dragItem, dropItem) => {
		let { manageList,layout,shadowCard } = this.props;
		manageList = _.cloneDeep(manageList);
		const targetGroupIndex = dropItem.index;
		const cardList = _.cloneDeep(dragItem.cardList);
    //拖拽卡片和目标组内卡片合并、去重
    cardList.forEach(item=>{
      item.gridx = shadowCard.gridx;
      item.gridy = shadowCard.gridy;
      for(var key in item){
        if(/^menu/.test(key)||/^service$/.test(key)){
            delete item[key]
        }
    }
    })
   
    //删除阴影的卡片
		_.forEach(manageList, (g, index) => {
			_.remove(g.children, (a) => {
				return a.isShadow === true;
			});
		});
		manageList[targetGroupIndex].children = _.concat(manageList[targetGroupIndex].children, cardList);
		manageList[targetGroupIndex].children = _.uniqBy(manageList[targetGroupIndex].children, 'widgetId');
		//目标组内重新横向压缩布局
    //todo: 数组偶然的几率出现重排
    manageList.splice()
		let compactedLayout = compactLayoutHorizontal(manageList[targetGroupIndex].children, layout.col);
		
		manageList[targetGroupIndex].children = compactedLayout;
		this.props.updateGroupList({manageList,isEdit:true});
	};

  componentWillUnmount() {
		window.removeEventListener('resize', this.handleLoad);
	}
	//组件渲染完毕时，添加resize事件
	componentDidMount() {
		window.addEventListener('resize', this.handleLoad);
      const { updateGroupList,groupList } = this.props;
        _.forEach(groupList, (g) => {
          _.forEach(g.children,(a)=>{
            a.isShadow = false;
            a.isChecked = false;
            a.gridx = undefined;//Number(a.gridx);
            a.gridy = undefined;//Number(a.gridy);
            addWidthAndHeight(a);
            // switch(a.size){
            //   case 1:
            //     a.height = 1;
            //     a.width = 1;
            //     break;
            //   case 2:
            //     a.height = 1;
            //     a.width = 2;
            //     break
            //   case 3:
            //     a.height = 2;
            //     a.width = 2;
            //     break
            //   case 4:
            //     a.height = 1;
            //     a.width = 3;
            //     break;
            //   case 5:
            //     a.height = 2;
            //     a.width = 3;
            //     break;
            //   case 6:
            //     a.height = 1;
            //     a.width = 4;
            //     break;
            //   case 7:
            //     a.height = 2;
            //     a.width = 4;
            //     break;
            //   case 8:
            //     a.height = 2;
            //     a.width = 6;
            //     break;
            //   case 9:
            //     a.height = 4;
            //     a.width = 6;
            //     break;
            //   default:
            //     a.height = 1;
            //     a.width = 1;
            // }
            
          })
          
        });
        updateGroupList(groupList);//把外界传入的数据，作为自己的状态数据，自己的状态是manageList
  }
  addGroupFn = (v)=>{
    const { addGroup } = this.props;
    addGroup({index:v})
  }
  renderContent() {
    var {
      manageList,
      selectGroup,
      selectList,
      currEditonlyId,
      dragState,
      moveGroup,
      selectListActions,
      selectGroupActions,
      setDragInputState,
      moveGroupDrag,
      moveItemDrag,
      languagesJSON,
    } = this.props;
    var manageProps = {
      manageList,
      selectGroup,
      selectList,
      currEditonlyId,
      dragState,
      moveGroup,
      selectListActions,
      selectGroupActions,
      setDragInputState,
    }
    var {
      manageList,
      drag,
      dragState,
      selectList,
      selectGroup,
      currEditonlyId,
      currGroupIndex,
      title,
      moveService,
      setCurrGroupIndex,
      editTitle,
      selectListActions,
      selectGroupActions,
      setDragInputState,
    } = this.props;
    var widgetListProps = {
      manageList,
      drag,
      dragState,
      selectList,
      selectGroup,
      currEditonlyId,
      currGroupIndex,
      title,
      moveService,
      setCurrGroupIndex,
      editTitle,
      selectListActions,
      selectGroupActions,
      setDragInputState,
    }
 
    let list = [];
    
    if(manageList.length == 0){
      return (
        <div className={addBtn} id="first-add">
          <ButtonDefaultAlpha className={addGroupBtn} onClick={this.addGroupFn.bind(this, 0)}>
            <Icon type="add" style={{verticalAlign:'sub'}}></Icon>
            {/* //添加组 */}
            {languagesJSON.addGroup}
          </ButtonDefaultAlpha>
        </div>
      );
    }else{
      manageList.map((item, index) =>{
        list.push(
          <ManageGroup
            data={item}
            cards={item.children}
            index={index}
            key={item.widgetId}
            id={item.widgetId}
            type={item.type}
            moveGroupDrag={moveGroupDrag}
            moveItemDrag={moveItemDrag}
            checkFun={this.checkFun}
            {...manageProps}
            {...widgetListProps}
            languagesJSON={languagesJSON}
            moveCardInGroupItem = {this.moveCardInGroupItem}
            handleLoad = {this.handleLoad}
            onCardDropInGroupItem = {this.onCardDropInGroupItem}
            onCardListDropInGroupItem = {this.onCardListDropInGroupItem}
            moveGroupItem={this.moveGroupItem}//移动分组
            acInputLocal={this.props.acInputLocal}
            roleEditMultiLang = {this.props.roleEditMultiLang}
            locale = {this.props.locale}
            on = {this.props.on}
            />
        )
      });
    }
    return list;
  }


  render(){
    return(
      <div className={um_content}>
      {this.renderContent()}
      </div>
    )
  }
}




